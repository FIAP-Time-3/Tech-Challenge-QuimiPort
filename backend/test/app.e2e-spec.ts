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
        .expect(200);

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
    {
      path: '/api/cargas-quimicas/1/historico',
      model: 'movimentacoes',
      key: 'step',
    },
  ] as const)('pagina a listagem em $path', async ({ path, model, key }) => {
    const rows = [1, 2, 3].map((id) => ({ id, step: id }));
    const { count, findMany } = prismaMock[model];
    count.mockResolvedValue(rows.length);
    findMany.mockImplementation(({ skip = 0, take = rows.length } = {}) =>
      rows.slice(skip, skip + take),
    );
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({ id: 1 });
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
    expect(count).toHaveBeenCalledOnce();
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
        expect(JSON.stringify(body)).not.toContain('stored-password-hash');
      });
  });

  it('aplica validação global ao DTO de login', async () => {
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 42, password: '' })
      .expect(400);
  });
});
