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

  const user = {
    id: 1,
    name: 'Maria Souza',
    email: 'maria@example.com',
    role: RolesEnum.OPERADOR,
    status: true,
  };
  const password = 'senha-atual';
  const newPassword = 'nova-senha';

  const prismaMock = {
    user: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
    $executeRaw: vi.fn(),
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'e2e-test-secret';
    process.env.PASSWORD_SALT = '4';
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(async (operation) =>
      operation(prismaMock),
    );
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
    expect(response.body.paths).toHaveProperty('/api/users/first_access');
    for (const segment of ['administradores', 'operadores', 'despachantes']) {
      expect(response.body.paths[`/api/${segment}/{id}`]).toHaveProperty('get');
      expect(
        response.body.paths[`/api/${segment}/password/{id}`],
      ).toHaveProperty('patch');
    }
    for (const [path, model] of [
      ['/api/administradores', 'UserResponseDto'],
      ['/api/operadores', 'UserResponseDto'],
      ['/api/despachantes', 'UserResponseDto'],
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
    const updateSchema = response.body.components.schemas.UpdateUserRequestDto;
    expect(updateSchema.required).toContain('status');
    expect(updateSchema.properties).not.toHaveProperty('password');
    expect(updateSchema.properties.status).not.toHaveProperty('default');
    const createSchema = response.body.components.schemas.CreateUserRequestDto;
    expect(createSchema.required).not.toContain('status');
    expect(createSchema.properties.status).toMatchObject({ default: true });
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
    { path: '/api/administradores', model: 'user', key: 'id' },
    { path: '/api/operadores', model: 'user', key: 'id' },
    { path: '/api/despachantes', model: 'user', key: 'id' },
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
    if (model === 'user') {
      const [query] = findMany.mock.lastCall ?? [];
      expect(query?.where).toBeDefined();
      expect(count).toHaveBeenLastCalledWith({ where: query?.where });
    } else {
      expect(count).toHaveBeenCalledExactlyOnceWith();
    }
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
        email: 'operador@email.com',
        name: 'Operador',
        password: 'stored-password-hash',
        role: 'OPERADOR',
        status: true,
      },
    ]);
    const token = await app
      .get(JwtService)
      .signAsync({ id: 1, token_use: 'access' });

    await request(app.getHttpServer())
      .get('/api/operadores')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          data: [{ id: 1, email: 'operador@email.com' }],
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        });
        expect(body.data[0]).not.toHaveProperty('password');
        expect(JSON.stringify(body)).not.toContain('stored-password-hash');
      });
  });

  it.each([
    { activeAdmins: 0, expectedStatus: 201 },
    { activeAdmins: 1, expectedStatus: 403 },
  ])(
    'permite primeiro acesso sem token com $activeAdmins administradores ativos e retorna $expectedStatus',
    async ({ activeAdmins, expectedStatus }) => {
      const { name, email } = user;
      prismaMock.user.count
        .mockResolvedValueOnce(activeAdmins)
        .mockResolvedValueOnce(0);
      prismaMock.user.create.mockResolvedValue({
        ...user,
        role: RolesEnum.ADMINISTRADOR,
      });

      await request(app.getHttpServer())
        .post('/api/users/first_access')
        .send({ name, email, password })
        .expect(expectedStatus);

      expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.user.create).toHaveBeenCalledTimes(
        expectedStatus === 201 ? 1 : 0,
      );
    },
  );

  it('exige token para consultar a própria conta e trocar a própria senha', async () => {
    const client = request(app.getHttpServer());
    await client.get('/api/me').expect(401);
    await client
      .patch('/api/me/password')
      .send({
        currentPassword: password,
        newPassword,
        newPasswordConfirm: newPassword,
      })
      .expect(401);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it.each(Object.values(RolesEnum))(
    'permite que %s consulte a própria conta e troque a própria senha',
    async (role) => {
      const { PasswordService } = await import(
        '../src/infra/security/password/password.service.js'
      );
      const currentUser = {
        ...user,
        role,
        password: await PasswordService.hash({ password }),
      };
      prismaMock.user.findFirst.mockResolvedValue(currentUser);
      prismaMock.user.findUnique.mockResolvedValue(currentUser);
      prismaMock.user.update.mockResolvedValue(currentUser);
      const token = await app
        .get(JwtService)
        .signAsync({ id: user.id, token_use: 'access' });
      const client = request(app.getHttpServer());

      const profile = await client
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(profile.body).toEqual({ ...user, role });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });

      const changed = await client
        .patch('/api/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: password,
          newPassword,
          newPasswordConfirm: newPassword,
        })
        .expect(200);
      expect(changed.body).toEqual({ ...user, role });
      expect(prismaMock.user.update).toHaveBeenCalledExactlyOnceWith({
        where: { id: user.id },
        data: { password: expect.any(String) },
      });
      const [{ data }] = prismaMock.user.update.mock.calls[0];
      await expect(
        PasswordService.compare({ password: newPassword, hash: data.password }),
      ).resolves.toBe(true);
    },
  );

  it.each([
    ...(
      [
        { segment: 'administradores', targetRole: RolesEnum.ADMINISTRADOR },
        { segment: 'operadores', targetRole: RolesEnum.OPERADOR },
        { segment: 'despachantes', targetRole: RolesEnum.DESPACHANTE },
      ] as const
    ).flatMap(({ segment, targetRole }) => {
      const path = `/api/${segment}`;
      const operadorPermitido = segment === 'despachantes';
      const body = { name: user.name, email: user.email };
      return [
        {
          method: 'post',
          path,
          body: { ...body, password },
          success: 201,
          operadorPermitido,
          targetRole,
        },
        {
          method: 'get',
          path,
          body: undefined,
          success: 200,
          operadorPermitido,
          targetRole,
        },
        {
          method: 'get',
          path: `${path}/1`,
          body: undefined,
          success: 200,
          operadorPermitido,
          targetRole,
        },
        {
          method: 'patch',
          path: `${path}/password/1`,
          body: { newPassword },
          success: 200,
          operadorPermitido,
          targetRole,
        },
        {
          method: 'put',
          path: `${path}/1`,
          body: { ...body, status: true },
          success: 200,
          operadorPermitido,
          targetRole,
        },
        {
          method: 'delete',
          path: `${path}/1`,
          body: undefined,
          success: 200,
          operadorPermitido,
          targetRole,
        },
      ] as const;
    }),
  ] as const)('aplica as permissões de $method $path', async (scenario) => {
    const { method, path, body, success, operadorPermitido, targetRole } =
      scenario;
    prismaMock.user.count.mockImplementation(async (args) =>
      args?.where?.email ? 0 : 1,
    );
    const target = { ...user, role: targetRole };
    prismaMock.user.findMany.mockResolvedValue([target]);
    prismaMock.user.findUnique.mockResolvedValue(target);
    prismaMock.user.create.mockResolvedValue(target);
    prismaMock.user.update.mockResolvedValue(target);
    const token = await app
      .get(JwtService)
      .signAsync({ id: user.id, token_use: 'access' });
    const client = request(app.getHttpServer());

    const call = () => {
      const pending = client[method](path);
      return body ? pending.send(body) : pending;
    };

    await call().expect(401);
    const setActor = (role: RolesEnum) => {
      prismaMock.user.findFirst.mockImplementation(async ({ where }) => {
        if (where.role === undefined) return { ...user, role };
        return where.id === target.id && where.role === target.role
          ? target
          : null;
      });
    };
    const deniedRoles = operadorPermitido
      ? [RolesEnum.DESPACHANTE]
      : [RolesEnum.OPERADOR, RolesEnum.DESPACHANTE];
    for (const role of deniedRoles) {
      setActor(role);
      await call().set('Authorization', `Bearer ${token}`).expect(403);
    }
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();

    setActor(RolesEnum.ADMINISTRADOR);
    await call().set('Authorization', `Bearer ${token}`).expect(success);
    if (operadorPermitido) {
      setActor(RolesEnum.OPERADOR);
      await call().set('Authorization', `Bearer ${token}`).expect(success);
    }

    if (method === 'patch') {
      const { PasswordService } = await import(
        '../src/infra/security/password/password.service.js'
      );
      const [{ where, data }] = prismaMock.user.update.mock.calls[0];
      expect(where).toEqual({ id: target.id });
      await expect(
        PasswordService.compare({ password: newPassword, hash: data.password }),
      ).resolves.toBe(true);
    }
  });

  it.each([
    ['administradores', RolesEnum.ADMINISTRADOR],
    ['operadores', RolesEnum.OPERADOR],
    ['despachantes', RolesEnum.DESPACHANTE],
  ] as const)(
    'impede consultar ou resetar outro perfil em /api/%s',
    async (segment, role) => {
      const id = 2;
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.findFirst.mockImplementation(async ({ where }) =>
        where.id === user.id
          ? { ...user, role: RolesEnum.ADMINISTRADOR }
          : null,
      );
      const token = await app
        .get(JwtService)
        .signAsync({ id: user.id, token_use: 'access' });
      const client = request(app.getHttpServer());

      await client
        .get(`/api/${segment}/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      await client
        .patch(`/api/${segment}/password/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword })
        .expect(404);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id, role },
      });
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { id, role },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    },
  );

  it.each(['put', 'delete'] as const)(
    'impede inativar o último administrador ativo via %s',
    async (method) => {
      const admin = { ...user, role: RolesEnum.ADMINISTRADOR };
      prismaMock.user.findFirst.mockResolvedValue(admin);
      prismaMock.user.findUnique.mockResolvedValue(admin);
      prismaMock.user.count.mockImplementation(async ({ where }) =>
        where.id?.not === admin.id ? 0 : 1,
      );
      const token = await app
        .get(JwtService)
        .signAsync({ id: admin.id, token_use: 'access' });
      const client = request(app.getHttpServer());
      const pending = client[method](`/api/administradores/${admin.id}`).set(
        'Authorization',
        `Bearer ${token}`,
      );

      if (method === 'put') {
        pending.send({ name: admin.name, email: admin.email, status: false });
      }

      await pending.expect(400);
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          role: RolesEnum.ADMINISTRADOR,
          status: true,
          id: { not: admin.id },
        },
      });
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    },
  );

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

    const client = request(app.getHttpServer());
    await client[method](path)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
