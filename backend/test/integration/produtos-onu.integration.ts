import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SecurityModule } from '../../src/infra/security/security.module.js';
import { ProdutoQuimicoModule } from '../../src/modules/produto-quimico/produto-quimico.module.js';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { CargaQuimicaService } from '../../src/modules/carga-quimica/application/carga-quimica.service.js';
import { RolesEnum } from '../../src/infra/security/enums/roles.enum.js';
import { DatabaseExceptionFilter } from '../../src/infra/filters/database-exception.filter.js';

let app: INestApplication<App>;
let prisma: PrismaService;
let token: string;
let adminId: number;
const product = {
  nome: 'Acetona',
  numeroONU: '1090',
  classeRisco: 3,
  status: true,
};

async function clean() {
  await prisma.movimentacoes.deleteMany();
  await prisma.cargaQuimicas.deleteMany();
  await prisma.produtosQuimicos.deleteMany();
  await prisma.user.deleteMany();
}

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [SecurityModule, ProdutoQuimicoModule],
  }).compile();
  app = module.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new DatabaseExceptionFilter());
  await app.init();
  prisma = app.get(PrismaService);
});
afterAll(async () => {
  if (prisma) await clean();
  if (app) {
    for (const client of app.get(PrismaService, { each: true }))
      await client.$disconnect();
    await app.close();
  }
});
beforeEach(async () => {
  await clean();
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'unused',
      role: RolesEnum.ADMINISTRADOR,
    },
  });
  adminId = admin.id;
  token = await app
    .get(JwtService)
    .signAsync({ id: adminId, token_use: 'access' });
});

function api(method: 'post' | 'put' | 'get', path: string) {
  const client = request(app.getHttpServer());
  return client[method](path).set('Authorization', `Bearer ${token}`);
}

describe('Número ONU com PostgreSQL real', () => {
  it('persiste quatro algarismos e permite compartilhar código entre produtos', async () => {
    const first = await api('post', '/api/produtos-quimicos')
      .send(product)
      .expect(201);
    const second = await api('post', '/api/produtos-quimicos')
      .send({ ...product, nome: 'Outro produto cadastrado' })
      .expect(201);
    expect(first.body.numeroONU).toBe('1090');
    expect(second.body.numeroONU).toBe('1090');
    expect(
      await prisma.produtosQuimicos.count({ where: { numeroONU: '1090' } }),
    ).toBe(2);
    const detail = await api(
      'get',
      `/api/produtos-quimicos/${first.body.id}`,
    ).expect(200);
    expect(detail.body.numeroONU).toBe('1090');
  });

  it('preserva zeros à esquerda na criação, edição e listagem', async () => {
    const created = await api('post', '/api/produtos-quimicos')
      .send({
        ...product,
        nome: 'Picrato de amônio',
        numeroONU: '0004',
        classeRisco: 1,
      })
      .expect(201);
    expect(created.body.numeroONU).toBe('0004');
    await api('put', `/api/produtos-quimicos/${created.body.id}`)
      .send({
        ...product,
        nome: 'Atualizado',
        numeroONU: '0005',
        classeRisco: 1,
      })
      .expect(200);
    const list = await api('get', '/api/produtos-quimicos')
      .query({ page: 1, limit: 1, column: 'numeroONU', order: 'desc' })
      .expect(200);
    expect(list.body).toMatchObject({
      data: [{ id: created.body.id, numeroONU: '0005' }],
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
    expect(
      (
        await prisma.produtosQuimicos.findUniqueOrThrow({
          where: { id: created.body.id },
        })
      ).numeroONU,
    ).toBe('0005');
  });

  it.each([
    undefined,
    null,
    '',
    '0000',
    '123',
    '12345',
    'UN 1090',
    '10.9',
    '+109',
    '1090\n',
    1090,
  ])('recusa cadastro com número ONU inválido %j', async (numeroONU) => {
    await api('post', '/api/produtos-quimicos')
      .send({ ...product, numeroONU })
      .expect(400);
    expect(await prisma.produtosQuimicos.count()).toBe(0);
  });

  it('recusa edição inválida sem alterar o produto', async () => {
    const stored = await prisma.produtosQuimicos.create({ data: product });
    await api('put', `/api/produtos-quimicos/${stored.id}`)
      .send({ ...product, numeroONU: '123' })
      .expect(400);
    expect(
      await prisma.produtosQuimicos.findUniqueOrThrow({
        where: { id: stored.id },
      }),
    ).toEqual(stored);
  });

  it.each(['0000', '123', '12345', 'UN1090', '1090\n'])(
    'garante formato %j também em escrita direta no banco',
    async (numeroONU) => {
      await expect(prisma.$executeRaw`
        INSERT INTO "ProdutosQuimicos" (nome, "numeroONU", "classeRisco", "updatedAt")
        VALUES ('Produto inválido', ${numeroONU}, 3, NOW())
      `).rejects.toMatchObject({
        code: 'P2010',
        meta: { driverAdapterError: { cause: { originalCode: '23514' } } },
      });
      expect(await prisma.produtosQuimicos.count()).toBe(0);
    },
  );

  it('expõe numeroONU do produto nos detalhes e listagem da carga', async () => {
    const stored = await prisma.produtosQuimicos.create({ data: product });
    const tecnico = await prisma.user.create({
      data: {
        name: 'Técnico',
        email: 'tecnico@example.com',
        password: 'unused',
        role: RolesEnum.OPERADOR,
      },
    });
    const service = new CargaQuimicaService(prisma);
    const carga = await service.create({
      body: {
        produtoQuimicoId: stored.id,
        quantidade: 1,
        unidadeMedida: 'kg',
        origem: 'Origem',
        destino: 'Destino',
        responsavelTecnicoId: tecnico.id,
      },
      usuario: { id: adminId, role: RolesEnum.ADMINISTRADOR },
    });
    expect(carga.produtoQuimico.numeroONU).toBe('1090');
    expect(
      (await service.findOne({ id: carga.id })).produtoQuimico.numeroONU,
    ).toBe('1090');
    const list = await service.findAll({
      paginatedSort: { page: 1, limit: 10, column: 'id', order: 'asc' },
    });
    expect(list.data[0].produtoQuimico.numeroONU).toBe('1090');
  });
});
