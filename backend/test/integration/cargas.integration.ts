import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { RolesEnum } from '../../src/infra/security/enums/roles.enum.js';
import { CargaQuimicaService } from '../../src/modules/carga-quimica/application/carga-quimica.service.js';
import { StatusCargaEnum as S } from '../../src/modules/carga-quimica/domain/value-objects/status-carga.enum.js';
import { TipoDocumentoEnum } from '../../src/modules/carga-quimica/domain/value-objects/tipo-documento.enum.js';

const prisma = new PrismaService();
const cargas = new CargaQuimicaService(prisma);

async function clean() {
  await prisma.documentoCargas.deleteMany();
  await prisma.movimentacoes.deleteMany();
  await prisma.cargaQuimicas.deleteMany();
  await prisma.produtosQuimicos.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(() => prisma.$connect());

afterAll(async () => {
  try {
    await clean();
  } finally {
    await prisma.$disconnect();
  }
});

beforeEach(clean);

async function setupCarga() {
  const usuario = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'unused',
      role: RolesEnum.ADMINISTRADOR,
    },
  });
  const produto = await prisma.produtosQuimicos.create({
    data: { nome: 'Acetona', numeroONU: '1090', classeRisco: 3 },
  });

  const body = {
    produtoQuimicoId: produto.id,
    quantidade: 1,
    unidadeMedida: 'kg',
    origem: 'Origem',
    destino: 'Destino',
    responsavelTecnicoId: usuario.id,
  };
  const carga = await cargas.create({ body, usuario });
  return { carga, body, usuario };
}

describe('Cargas com PostgreSQL real', () => {
  it('aceita administrador e operador ativos na designação de responsável técnico', async () => {
    const { carga, body, usuario } = await setupCarga();
    expect(carga.responsavelTecnicoId).toBe(usuario.id);

    const operador = await prisma.user.create({
      data: {
        name: 'Operador',
        email: 'operador@example.com',
        password: 'unused',
        role: RolesEnum.OPERADOR,
      },
    });
    await cargas.update({
      id: carga.id,
      body: { ...body, responsavelTecnicoId: operador.id },
    });
    const atualizada = await prisma.cargaQuimicas.findUniqueOrThrow({
      where: { id: carga.id },
    });
    expect(atualizada.responsavelTecnicoId).toBe(operador.id);
  });

  it.each([
    { role: RolesEnum.DESPACHANTE, status: true },
    { role: RolesEnum.OPERADOR, status: false },
  ])(
    'preserva o responsável ao tentar designar $role com status $status',
    async (perfil) => {
      const { carga, body, usuario } = await setupCarga();
      const candidato = await prisma.user.create({
        data: {
          name: 'Candidato',
          email: 'candidato@example.com',
          password: 'unused',
          ...perfil,
        },
      });

      await expect(
        cargas.update({
          id: carga.id,
          body: { ...body, responsavelTecnicoId: candidato.id },
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      const atualizada = await prisma.cargaQuimicas.findUniqueOrThrow({
        where: { id: carga.id },
      });
      expect(atualizada.responsavelTecnicoId).toBe(usuario.id);
    },
  );

  it('persiste o novo status e mantém o histórico em ordem', async () => {
    const { carga, usuario } = await setupCarga();

    await cargas.transicionar({
      id: carga.id,
      statusDestino: S.EM_PREPARACAO,
      usuario,
    });

    const salva = await prisma.cargaQuimicas.findUniqueOrThrow({
      where: { id: carga.id },
      include: { movimentacoes: { orderBy: { step: 'asc' } } },
    });
    expect(salva.statusCarga).toBe(S.EM_PREPARACAO);
    expect(salva.movimentacoes).toMatchObject([
      { step: 1, statusAnterior: null, statusAtual: S.CADASTRADA },
      {
        step: 2,
        statusAnterior: S.CADASTRADA,
        statusAtual: S.EM_PREPARACAO,
        usuarioId: usuario.id,
      },
    ]);
  });

  it('reverte a mudança de status quando a movimentação falha', async () => {
    const { carga, usuario } = await setupCarga();
    const where = { id: carga.id };
    const include = { movimentacoes: true };
    const antes = await prisma.cargaQuimicas.findUniqueOrThrow({
      where,
      include,
    });

    // O identificador fora do intervalo de Int força a falha no INSERT do histórico.
    await expect(
      cargas.transicionar({
        id: carga.id,
        statusDestino: S.EM_PREPARACAO,
        usuario: { ...usuario, id: 2147483648 },
      }),
    ).rejects.toThrow(/usuarioId|INT4|2147483648/i);

    expect(
      await prisma.cargaQuimicas.findUniqueOrThrow({ where, include }),
    ).toEqual(antes);
  });

  it('persiste o registro do documento e devolve os bytes enviados', async () => {
    const { carga } = await setupCarga();
    const diretorio = await mkdtemp(join(tmpdir(), 'quimiport-cargas-'));
    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(diretorio);
    const arquivo = Buffer.from('%PDF-1.7\nDocumento de teste\n%%EOF');

    try {
      const documento = await cargas.adicionarDocumento({
        id: carga.id,
        tipoDocumento: TipoDocumentoEnum.FISPQ,
        arquivo,
      });
      expect(
        await prisma.documentoCargas.findUniqueOrThrow({
          where: { id: documento.id },
        }),
      ).toMatchObject({
        cargaQuimicaId: carga.id,
        tipoDocumento: TipoDocumentoEnum.FISPQ,
        validado: false,
      });
      await expect(
        cargas.obterArquivoDocumento({ id: carga.id, docId: documento.id }),
      ).resolves.toEqual(arquivo);
    } finally {
      cwd.mockRestore();
      await rm(diretorio, { recursive: true, force: true });
    }
  });
});
