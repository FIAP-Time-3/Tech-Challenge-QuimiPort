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
      roles: ['ADMINISTRADOR'],
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

  it('aplica perfis a rota protegida e aceita administrador', async () => {
    const jwt = app.get(JwtService);
    const token = await jwt.signAsync({ id: 1, token_use: 'access' });
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: 1,
      email: 'tecnico@email.com',
      roles: ['QUALIDADE'],
      status: true,
    });

    await request(app.getHttpServer())
      .get('/api/produtos-quimicos')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/produtos-quimicos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect([]);
    expect(prismaMock.produtosQuimicos.findMany).toHaveBeenCalledOnce();
  });

  it('não expõe hash da senha em respostas HTTP de usuários', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 1,
        email: 'admin@email.com',
        name: 'Administrador',
        password: 'stored-password-hash',
        roles: ['ADMINISTRADOR'],
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
