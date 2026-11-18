import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setupSwagger } from '../src/infra/swagger/swagger.js';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/infra/database/prisma.service.js';
import { RolesEnum } from '../src/infra/security/enums/roles.enum.js';

describe('API HTTP (e2e)', () => {
  let app: INestApplication<App>;
  let swaggerDir: string;

  const prismaMock = {
    user: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    produtosQuimicos: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    cargaQuimicas: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    movimentacoes: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.PASSWORD_SALT = '4';
    vi.resetAllMocks();
    prismaMock.user.count.mockResolvedValue(1);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      email: 'admin@email.com',
      role: 'ADMINISTRADOR',
      status: true,
    });
    prismaMock.produtosQuimicos.count.mockResolvedValue(0);
    prismaMock.produtosQuimicos.findMany.mockResolvedValue([]);
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const { AppModule } = await import('../src/app.module.js');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    swaggerDir = mkdtempSync(join(tmpdir(), 'quimiport-swagger-'));
    setupSwagger(app, swaggerDir);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    rmSync(swaggerDir, { recursive: true, force: true });
  });

  it('serve Swagger UI e OpenAPI JSON público compatível com os arquivos exportados', async () => {
    await request(app.getHttpServer())
      .get('/api/api-docs/')
      .expect(200)
      .expect('Content-Type', /html/u);
    const response = await request(app.getHttpServer())
      .get('/api/api-docs-json')
      .expect(200);
    expect(response.body.openapi).toBe('3.0.0');
    expect(response.body.paths).toHaveProperty('/api/users');
    for (const [path, model] of [
      ['/api/users', 'UserResponseDto'],
      ['/api/produtos-quimicos', 'ProdutoQuimicoResponseDto'],
      ['/api/cargas-quimicas', 'CargaQuimicaResponseDto'],
      ['/api/cargas-quimicas/{id}/historico', 'MovimentacaoResponseDto'],
    ]) {
      expect(
        response.body.paths[path].get.responses['200'].content[
          'application/json'
        ].schema,
      ).toMatchObject({
        type: 'object',
        required: ['data', 'page', 'limit', 'total', 'totalPages'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model}` },
          },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      });
    }
    expect(response.body.paths['/api/login'].post.security).toEqual([]);
    expect(
      response.body.components.schemas.UpdateUserDto.properties,
    ).not.toHaveProperty('password');
    expect(
      JSON.parse(readFileSync(join(swaggerDir, 'openapi.json'), 'utf8')),
    ).toEqual(response.body);
    expect(readFileSync(join(swaggerDir, 'collection.json'), 'utf8')).toBe(
      readFileSync(join(swaggerDir, 'openapi.json'), 'utf8'),
    );
  });

  it('expõe health check público sob prefixo /api', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          api: 'ok',
          status: 'ok',
          services: { database: true },
        });
      });

    expect(prismaMock.user.count).not.toHaveBeenCalled();
    await request(app.getHttpServer()).get('/health').expect(404);
  });

  it('exige autenticação para rotas de produtos', async () => {
    await request(app.getHttpServer())
      .get('/api/produtos-quimicos')
      .expect(401);
    expect(prismaMock.produtosQuimicos.findMany).not.toHaveBeenCalled();
  });

  it.each([
    { role: RolesEnum.DESPACHANTE, statusCadastro: 403 },
    { role: RolesEnum.ADMINISTRADOR, statusCadastro: 201 },
    { role: RolesEnum.OPERADOR, statusCadastro: 201 },
  ])(
    'permite consulta para $role e retorna $statusCadastro no cadastro',
    async ({ role, statusCadastro }) => {
      const token = await app
        .get(JwtService)
        .signAsync({ id: 1, token_use: 'access' });
      prismaMock.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'usuario@email.com',
        role,
        status: true,
      });
      const body = { nome: 'Acetona', numeroONU: '1090', classeRisco: 3 };
      const produto = { id: 1, ...body, status: true };
      prismaMock.produtosQuimicos.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.create.mockResolvedValue(produto);
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(produto);

      await request(app.getHttpServer())
        .get('/api/produtos-quimicos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, { data: [], page: 1, limit: 10, total: 0, totalPages: 0 });

      await request(app.getHttpServer())
        .post('/api/produtos-quimicos')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(statusCadastro);

      expect(prismaMock.produtosQuimicos.create).toHaveBeenCalledTimes(
        statusCadastro === 201 ? 1 : 0,
      );
    },
  );

  it.each([
    { path: '/api/users', model: 'user', key: 'id' },
    { path: '/api/produtos-quimicos', model: 'produtosQuimicos', key: 'id' },
    { path: '/api/cargas-quimicas', model: 'cargaQuimicas', key: 'id' },
  ] as const)('pagina a listagem em $path', async ({ path, model, key }) => {
    const rows = [1, 2, 3].map((id) => ({ id, step: id }));
    const { count, findMany } = prismaMock[model];
    count.mockResolvedValue(rows.length);
    findMany.mockImplementation(({ skip = 0, take = rows.length } = {}) =>
      rows.slice(skip, skip + take),
    );
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    const response = await request(app.getHttpServer())
      .get(path)
      .query({ page: 2, limit: 2 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      data: [{ [key]: 3 }],
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(response.body.data).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 2, take: 2 }),
    );
    expect(count.mock.calls.filter((args) => args.length === 0)).toHaveLength(
      1,
    );
  });

  it('pagina o histórico da carga em ordem de etapa', async () => {
    const rows = [1, 2, 3].map((step) => ({ step }));
    const where = { cargaQuimicaId: 1 };
    const { count, findMany } = prismaMock.movimentacoes;
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({ id: 1 });
    count.mockResolvedValue(rows.length);
    findMany.mockImplementation(({ skip = 0, take = rows.length } = {}) =>
      rows.slice(skip, skip + take),
    );
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    const response = await request(app.getHttpServer())
      .get('/api/cargas-quimicas/1/historico')
      .query({ page: 2, limit: 2 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      data: [{ step: 3 }],
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: { step: 'asc' },
      skip: 2,
      take: 2,
    });
    expect(count).toHaveBeenCalledExactlyOnceWith({ where });
  });

  it('retorna todos os próximos status mesmo com parâmetros de paginação', async () => {
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    const response = await request(app.getHttpServer())
      .get('/api/cargas-quimicas/transicoes/CADASTRADA')
      .query({ page: 2, limit: 1 })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(['EM_PREPARACAO', 'CANCELADA']);
  });

  it('não expõe hash da senha em respostas HTTP de usuários', async () => {
    prismaMock.user.count.mockResolvedValue(1);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 1,
        email: 'admin@email.com',
        name: 'Administrador',
        password: 'stored-password-hash',
        role: 'ADMINISTRADOR',
        status: true,
      },
    ]);
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          data: [{ id: 1, email: 'admin@email.com' }],
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        });
        expect(body.data[0]).not.toHaveProperty('password');
        expect(JSON.stringify(body)).not.toContain('stored-password-hash');
      });
  });

  it('aplica validação global ao DTO de login', async () => {
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 42, password: '' })
      .expect(400);
  });

  it('permite ao despachante consultar cargas químicas paginadas', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      role: RolesEnum.DESPACHANTE,
      status: true,
    });
    prismaMock.cargaQuimicas.count.mockResolvedValue(0);
    prismaMock.cargaQuimicas.findMany.mockResolvedValue([]);
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    await request(app.getHttpServer())
      .get('/api/cargas-quimicas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200, { data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it.each([
    ['put', '/api/produtos-quimicos/1'],
    ['patch', '/api/produtos-quimicos/1/inativar'],
    ['delete', '/api/produtos-quimicos/1'],
    ['post', '/api/cargas-quimicas'],
    ['put', '/api/cargas-quimicas/1'],
    ['patch', '/api/cargas-quimicas/1/cancelar'],
    ['post', '/api/cargas-quimicas/1/documentos'],
    ['patch', '/api/cargas-quimicas/1/documentos/1/validar'],
  ] as const)('nega %s %s ao despachante', async (method, path) => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      role: RolesEnum.DESPACHANTE,
      status: true,
    });
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    await request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
