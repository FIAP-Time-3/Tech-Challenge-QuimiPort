import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { StatusCargaEnum as S } from '../domain/value-objects/StatusCarga.enum.js';
import { TipoDocumentoEnum } from '../domain/value-objects/TipoDocumento.enum.js';
import { CargaQuimicaService } from './CargaQuimica.service.js';

describe('CargaQuimicaService', () => {
  let service: CargaQuimicaService;

  const prismaMock = {
    produtosQuimicos: { findUnique: vi.fn() },
    cargaQuimicas: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    movimentacoes: { create: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
    documentoCargas: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  };

  const admin = { id: 1, roles: ['ADMINISTRADOR'] };
  const body = {
    produtoQuimicoId: 1,
    quantidade: 100,
    unidadeMedida: 'kg',
    origem: 'Rotterdam',
    destino: 'Santos',
    responsavelTecnico: 'Maria Souza',
  };
  const docsOk = [
    { tipoDocumento: 'FISPQ', validado: true },
    { tipoDocumento: 'NOTA_FISCAL', validado: true },
  ];

  const carga = (statusCarga: S, documentoCargases: unknown[] = []) => ({
    id: 10,
    produtoQuimicoId: 1,
    statusCarga,
    classeRiscoONU: 3,
    documentoCargases,
  });

  const dadosDaUltimaMovimentacao = () =>
    prismaMock.movimentacoes.create.mock.calls[0][0].data;

  beforeEach(async () => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation((cb: (tx: unknown) => unknown) =>
      cb(prismaMock),
    );
    prismaMock.movimentacoes.aggregate.mockResolvedValue({ _max: { step: 1 } });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargaQuimicaService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(CargaQuimicaService);
  });

  describe('registro', () => {
    it('cria carga CADASTRADA, herda a classe do produto e registra o step 1', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
        id: 1,
        status: true,
        classeRisco: 3,
      });
      prismaMock.cargaQuimicas.create.mockResolvedValue({ id: 10 });
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
        ...carga(S.CADASTRADA),
        ...body,
      });

      const result = await service.create({ body, usuario: admin });

      expect(prismaMock.cargaQuimicas.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          statusCarga: 'CADASTRADA',
          classeRiscoONU: 3,
          responsavelTecnico: 'Maria Souza',
        }),
      });
      expect(dadosDaUltimaMovimentacao()).toMatchObject({
        cargaQuimicaId: 10,
        step: 1,
        statusAnterior: null,
        statusAtual: 'CADASTRADA',
        usuarioId: 1,
      });
      expect(result.codigo).toBe('CQ-000010');
    });

    it('recusa produto inativo', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
        id: 1,
        status: false,
        classeRisco: 3,
      });

      await expect(service.create({ body, usuario: admin })).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.cargaQuimicas.create).not.toHaveBeenCalled();
    });

    it('recusa produto inexistente', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(null);

      await expect(service.create({ body, usuario: admin })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('atualização de dados', () => {
    it('recusa trocar o produto fora de CADASTRADA', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_PREPARACAO),
      );

      await expect(
        service.update({ id: 10, body: { ...body, produtoQuimicoId: 2 } }),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.cargaQuimicas.update).not.toHaveBeenCalled();
    });

    it('troca o produto em CADASTRADA e atualiza a classe herdada', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.CADASTRADA),
      );
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
        id: 2,
        status: true,
        classeRisco: 8,
      });

      await service.update({ id: 10, body: { ...body, produtoQuimicoId: 2 } });

      expect(prismaMock.cargaQuimicas.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({
          produtoQuimicoId: 2,
          classeRiscoONU: 8,
        }),
      });
    });

    it('recusa alterar carga em estado terminal', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.FINALIZADA),
      );

      await expect(service.update({ id: 10, body })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('status', () => {
    it('atualiza o status e registra o próximo step', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.CADASTRADA),
      );

      await service.transicionar({
        id: 10,
        statusDestino: S.EM_PREPARACAO,
        usuario: admin,
      });

      expect(prismaMock.cargaQuimicas.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { statusCarga: 'EM_PREPARACAO' },
      });
      expect(dadosDaUltimaMovimentacao()).toMatchObject({
        step: 2,
        statusAnterior: 'CADASTRADA',
        statusAtual: 'EM_PREPARACAO',
      });
    });

    it('recusa transição fora do fluxo', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.CADASTRADA),
      );

      await expect(
        service.transicionar({
          id: 10,
          statusDestino: S.FINALIZADA,
          usuario: admin,
        }),
      ).rejects.toThrow(ConflictException);
      expect(prismaMock.cargaQuimicas.update).not.toHaveBeenCalled();
    });

    it('recusa movimentar carga bloqueada', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(carga(S.BLOQUEADA));

      await expect(
        service.transicionar({
          id: 10,
          statusDestino: S.EM_MOVIMENTACAO,
          usuario: admin,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('recusa finalizar carga em inspeção sem liberar', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO),
      );

      await expect(
        service.transicionar({
          id: 10,
          statusDestino: S.FINALIZADA,
          usuario: admin,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('recusa quem não atua na etapa', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.CADASTRADA),
      );

      await expect(
        service.transicionar({
          id: 10,
          statusDestino: S.EM_PREPARACAO,
          usuario: { id: 5, roles: ['QUALIDADE'] },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('devolve 404 para carga inexistente', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(null);

      await expect(
        service.transicionar({
          id: 99,
          statusDestino: S.EM_PREPARACAO,
          usuario: admin,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('liberação e bloqueio', () => {
    it('recusa liberar sem a documentação obrigatória', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO, [{ tipoDocumento: 'FISPQ', validado: true }]),
      );

      await expect(service.liberar({ id: 10, usuario: admin })).rejects.toThrow(
        /NOTA_FISCAL/,
      );
      expect(prismaMock.cargaQuimicas.update).not.toHaveBeenCalled();
    });

    it('recusa liberar com documento ainda não validado', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO, [
          { tipoDocumento: 'FISPQ', validado: true },
          { tipoDocumento: 'NOTA_FISCAL', validado: false },
        ]),
      );

      await expect(service.liberar({ id: 10, usuario: admin })).rejects.toThrow(
        ConflictException,
      );
    });

    it('libera com a documentação completa e validada', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO, docsOk),
      );

      await service.liberar({ id: 10, usuario: admin });

      expect(dadosDaUltimaMovimentacao()).toMatchObject({
        statusAnterior: 'EM_INSPECAO',
        statusAtual: 'LIBERADA',
      });
    });

    it('exige motivo para bloquear', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO),
      );

      await expect(
        service.bloquear({ id: 10, motivo: '   ', usuario: admin }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelamento', () => {
    it('cancela com motivo e preserva o histórico', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(carga(S.LIBERADA));

      await service.cancelar({
        id: 10,
        motivo: 'Documento inválido',
        usuario: admin,
      });

      expect(prismaMock.cargaQuimicas.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { statusCarga: 'CANCELADA' },
      });
      expect(dadosDaUltimaMovimentacao()).toMatchObject({
        statusAtual: 'CANCELADA',
        notes: 'Documento inválido',
      });
    });

    it('exige motivo para cancelar', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(carga(S.LIBERADA));

      await expect(
        service.cancelar({ id: 10, motivo: '', usuario: admin }),
      ).rejects.toThrow(BadRequestException);
    });

    it('recusa cancelar carga finalizada', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.FINALIZADA),
      );

      await expect(
        service.cancelar({ id: 10, motivo: 'x', usuario: admin }),
      ).rejects.toThrow(ConflictException);
    });

    it('recusa cancelar carga já cancelada', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(carga(S.CANCELADA));

      await expect(
        service.cancelar({ id: 10, motivo: 'x', usuario: admin }),
      ).rejects.toThrow(ConflictException);
    });

    it('só administrador e gestor cancelam', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(carga(S.LIBERADA));

      await expect(
        service.cancelar({
          id: 10,
          motivo: 'x',
          usuario: { id: 7, roles: ['OPERADOR'] },
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('documentos', () => {
    it('registra documento como não validado', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_PREPARACAO),
      );
      prismaMock.documentoCargas.findFirst.mockResolvedValue(null);
      prismaMock.documentoCargas.create.mockResolvedValue({
        id: 1,
        tipoDocumento: 'FISPQ',
        validado: false,
      });

      await service.adicionarDocumento({
        id: 10,
        tipoDocumento: TipoDocumentoEnum.FISPQ,
      });

      expect(prismaMock.documentoCargas.create).toHaveBeenCalledWith({
        data: { cargaQuimicaId: 10, tipoDocumento: 'FISPQ', validado: false },
      });
    });

    it('recusa documento duplicado', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_PREPARACAO),
      );
      prismaMock.documentoCargas.findFirst.mockResolvedValue({ id: 1 });

      await expect(
        service.adicionarDocumento({
          id: 10,
          tipoDocumento: TipoDocumentoEnum.FISPQ,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('valida documento da carga', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO),
      );
      prismaMock.documentoCargas.findFirst.mockResolvedValue({
        id: 1,
        tipoDocumento: 'FISPQ',
      });
      prismaMock.documentoCargas.update.mockResolvedValue({
        id: 1,
        tipoDocumento: 'FISPQ',
        validado: true,
      });

      await service.validarDocumento({ id: 10, docId: 1 });

      expect(prismaMock.documentoCargas.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { validado: true },
      });
    });

    it('devolve 404 para documento de outra carga', async () => {
      prismaMock.cargaQuimicas.findUnique.mockResolvedValue(
        carga(S.EM_INSPECAO),
      );
      prismaMock.documentoCargas.findFirst.mockResolvedValue(null);

      await expect(
        service.validarDocumento({ id: 10, docId: 99 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
