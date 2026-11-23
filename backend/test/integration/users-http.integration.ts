import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SecurityModule } from '../../src/infra/security/security.module.js';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { PasswordService } from '../../src/infra/security/password/password.service.js';
import { DatabaseExceptionFilter } from '../../src/infra/filters/database-exception.filter.js';

let app: INestApplication<App>;
let prisma: PrismaService;
let adminToken: string;
const credentials = { email: 'Admin@example.com', password: 'secret' };
const userBody = {
  email: 'Bruno@example.com',
  name: 'Bruno Dias',
  password: 'secret',
  role: 'OPERADOR',
  status: true,
};

const updateBody = {
  email: userBody.email,
  name: userBody.name,
  role: userBody.role,
  status: userBody.status,
};

function expectSafeUser(user: Record<string, unknown>, email: string) {
  expect(user).toMatchObject({ id: expect.any(Number), email });
  expect(user).not.toHaveProperty('username');
  expect(user).not.toHaveProperty('password');
}

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [SecurityModule],
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
  if (prisma) await prisma.$disconnect();
  if (app) await app.close();
});
beforeEach(async () => {
  await prisma.user.deleteMany();
  await request(app.getHttpServer())
    .post('/api/users/first_access')
    .send({ ...credentials, name: 'Administrador' })
    .expect(201);
  const response = await request(app.getHttpServer())
    .post('/api/login')
    .send(credentials)
    .expect(201);
  adminToken = response.body.access_token;
});

function authorized(method: 'get' | 'post' | 'put' | 'delete', path: string) {
  const client = request(app.getHttpServer());
  return client[method](path).set('Authorization', `Bearer ${adminToken}`);
}

describe('Contratos HTTP de usuários com PostgreSQL real', () => {
  it('expõe email e oculta username/senha em criação, listagem, detalhe, edição e /me', async () => {
    const created = await authorized('post', '/api/users')
      .send(userBody)
      .expect(201);
    expectSafeUser(created.body, userBody.email);
    const id = created.body.id;
    const list = await authorized('get', '/api/users').expect(200);
    expect(list.body).toMatchObject({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
    expect(list.body.data).toHaveLength(2);
    expectSafeUser(list.body.data[0], credentials.email);
    expectSafeUser(list.body.data[1], userBody.email);
    const secondPage = await authorized('get', '/api/users')
      .query({ page: 2, limit: 1, column: 'id', order: 'desc' })
      .expect(200);
    expect(secondPage.body).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(secondPage.body.data).toHaveLength(1);
    expectSafeUser(secondPage.body.data[0], credentials.email);
    const detail = await authorized('get', `/api/users/${id}`).expect(200);
    expectSafeUser(detail.body, userBody.email);
    const updated = await authorized('put', `/api/users/${id}`)
      .send({ ...updateBody, email: 'Novo@example.com' })
      .expect(200);
    expectSafeUser(updated.body, 'Novo@example.com');
    const me = await authorized('get', '/api/me').expect(200);
    expectSafeUser(me.body, credentials.email);
  });

  it('recusa username legado na criação, edição, login e primeiro acesso', async () => {
    await authorized('post', '/api/users')
      .send({ ...userBody, username: 'bruno' })
      .expect(400);
    const created = await authorized('post', '/api/users')
      .send(userBody)
      .expect(201);
    await authorized('put', `/api/users/${created.body.id}`)
      .send({ ...updateBody, username: 'bruno' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ ...credentials, username: 'admin' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/users/first_access')
      .send({ ...credentials, name: 'Admin', username: 'admin' })
      .expect(400);
  });

  it.each([undefined, '', 'email-invalido'])(
    'recusa cadastro com email inválido: %s',
    async (email) => {
      await authorized('post', '/api/users')
        .send({ ...userBody, email })
        .expect(400);
      expect(await prisma.user.count()).toBe(1);
    },
  );

  it('retorna 409 para email duplicado no cadastro e na edição, ignorando caixa', async () => {
    await authorized('post', '/api/users').send(userBody).expect(201);
    await authorized('post', '/api/users')
      .send({ ...userBody, email: 'BRUNO@EXAMPLE.COM' })
      .expect(409);
    const other = await authorized('post', '/api/users')
      .send({ ...userBody, email: 'other@example.com' })
      .expect(201);
    await authorized('put', `/api/users/${other.body.id}`)
      .send({ ...updateBody, email: 'BRUNO@EXAMPLE.COM' })
      .expect(409);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: other.body.id } }))
        .email,
    ).toBe('other@example.com');
  });

  it('executa criação → login → /me → troca de email → novo login', async () => {
    const created = await authorized('post', '/api/users')
      .send(userBody)
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 'BRUNO@EXAMPLE.COM', password: userBody.password })
      .expect(201);
    const me = await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(200);
    expectSafeUser(me.body, userBody.email);
    await authorized('put', `/api/users/${created.body.id}`)
      .send({ ...updateBody, email: 'Novo@example.com' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: userBody.email, password: userBody.password })
      .expect(401);
    const next = await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: 'NOVO@EXAMPLE.COM', password: userBody.password })
      .expect(201);
    const nextMe = await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${next.body.access_token}`)
      .expect(200);
    expectSafeUser(nextMe.body, 'Novo@example.com');
  });

  it('mantém exclusão lógica e recusa login, acesso e refresh após inativação', async () => {
    const created = await authorized('post', '/api/users')
      .send(userBody)
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: userBody.email, password: userBody.password })
      .expect(201);
    await authorized('delete', `/api/users/${created.body.id}`).expect(200);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: created.body.id } }),
    ).toMatchObject({ status: false, email: userBody.email });
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: userBody.email, password: userBody.password })
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/login/refresh')
      .send({ refresh_token: login.body.refresh_token })
      .expect(401);
  });

  it('preserva o hash ao editar sem senha e rejeita troca de senha no PUT atual', async () => {
    const created = await authorized('post', '/api/users')
      .send(userBody)
      .expect(201);
    const id = created.body.id;
    const before = await prisma.user.findUniqueOrThrow({ where: { id } });
    const rejected = await authorized('put', `/api/users/${id}`)
      .send({ ...updateBody, password: 'nova-senha' })
      .expect(400);
    expect(rejected.body.message).toContain(
      'property password should not exist',
    );
    await authorized('put', `/api/users/${id}`)
      .send({ ...updateBody, name: 'Novo Nome' })
      .expect(200);
    const after = await prisma.user.findUniqueOrThrow({ where: { id } });
    expect(after.password).toBe(before.password);
    expect(after.name).toBe('Novo Nome');
    await request(app.getHttpServer())
      .post('/api/login')
      .send({ email: userBody.email, password: userBody.password })
      .expect(201);
  });

  it.each([true, false])(
    'preserva status %s e hash ao editar nome e e-mail',
    async (status) => {
      const created = await authorized('post', '/api/users')
        .send({ ...userBody, status })
        .expect(201);
      const id = created.body.id;
      const before = await prisma.user.findUniqueOrThrow({ where: { id } });
      const result = await authorized('put', `/api/users/${id}`)
        .send({
          name: 'Nome Alterado',
          email: 'alterado@example.com',
          role: userBody.role,
        })
        .expect(200);
      expect(result.body).toMatchObject({
        status,
        role: userBody.role,
        email: 'alterado@example.com',
      });
      const after = await prisma.user.findUniqueOrThrow({ where: { id } });
      expect(after).toMatchObject({
        status,
        role: userBody.role,
        name: 'Nome Alterado',
        email: 'alterado@example.com',
      });
      expect(after.password).toBe(before.password);
      await request(app.getHttpServer())
        .post('/api/login')
        .send({ email: 'alterado@example.com', password: userBody.password })
        .expect(status ? 201 : 401);
    },
  );

  it.each([true, false])(
    'permite alterar status explicitamente para %s',
    async (status) => {
      const created = await authorized('post', '/api/users')
        .send({ ...userBody, status: !status })
        .expect(201);
      await authorized('put', `/api/users/${created.body.id}`)
        .send({ ...updateBody, status })
        .expect(200);
      expect(
        await prisma.user.findUniqueOrThrow({ where: { id: created.body.id } }),
      ).toMatchObject({ status, role: userBody.role });
    },
  );

  it('recusa status textual sem alterar dados persistidos', async () => {
    const created = await authorized('post', '/api/users')
      .send({ ...userBody, status: false })
      .expect(201);
    const id = created.body.id;
    const before = await prisma.user.findUniqueOrThrow({ where: { id } });
    await authorized('put', `/api/users/${id}`)
      .send({ ...updateBody, name: 'Não Persistir', status: 'true' })
      .expect(400);
    expect(await prisma.user.findUniqueOrThrow({ where: { id } })).toEqual(
      before,
    );
  });

  it('aplica status ativo padrão no cadastro sem status', async () => {
    const created = await authorized('post', '/api/users')
      .send({
        name: userBody.name,
        email: userBody.email,
        password: userBody.password,
        role: userBody.role,
      })
      .expect(201);
    expect(created.body).toMatchObject({ status: true, role: userBody.role });
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: created.body.id } }),
    ).toMatchObject({ status: true, role: userBody.role });
  });

  it('consulta setup e impede repetir o primeiro acesso', async () => {
    const setup = await request(app.getHttpServer())
      .get('/api/login/setup')
      .expect(200);
    expect(setup.body).toEqual({ requiresSetup: false });
    await request(app.getHttpServer())
      .post('/api/users/first_access')
      .send({ ...credentials, email: 'outro@example.com', name: 'Outro' })
      .expect(403);
    expect(await prisma.user.count()).toBe(1);
  });
});

describe('Rotas de operadores', () => {
  const base = '/api/operadores';
  const body = {
    name: userBody.name,
    email: userBody.email,
    password: userBody.password,
  };
  const changes = { name: 'Nome Editado', email: 'editado@example.com' };

  async function createOperador(
    overrides: { email?: string; status?: boolean } = {},
  ) {
    const response = await authorized('post', base)
      .send({ ...body, ...overrides })
      .expect(201);
    return response.body as { id: number; email: string; status: boolean };
  }

  it.each([undefined, false])(
    'cadastra operador com status enviado %s',
    async (status) => {
      const created = await createOperador(
        status === undefined ? {} : { status },
      );
      expectSafeUser(created, body.email);
      expect(created).toMatchObject({
        role: 'OPERADOR',
        status: status ?? true,
      });
      const saved = await prisma.user.findUniqueOrThrow({
        where: { id: created.id },
      });
      expect(saved.status).toBe(status ?? true);
      expect(saved.password).not.toBe(body.password);
      await expect(
        PasswordService.compare({
          hash: saved.password,
          password: body.password,
        }),
      ).resolves.toBe(true);
    },
  );

  it('recusa perfil explícito no cadastro', async () => {
    await authorized('post', base)
      .send({ ...body, role: 'ADMINISTRADOR' })
      .expect(400);
    expect(
      await prisma.user.findUnique({ where: { email: body.email } }),
    ).toBeNull();
  });

  it('aplica os filtros de perfil e e-mail tanto na página quanto no total', async () => {
    const first = await createOperador({
      email: 'equipe-primeiro@example.com',
    });
    await createOperador({ email: 'equipe-segundo@example.com' });
    await createOperador({ email: 'avulso@example.com' });
    await authorized('post', '/api/users')
      .send({
        ...body,
        email: 'equipe-despachante@example.com',
        role: 'DESPACHANTE',
      })
      .expect(201);

    const response = await authorized('get', base)
      .query({
        email: 'equipe-',
        page: 2,
        limit: 1,
        column: 'id',
        order: 'desc',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      totalPages: 2,
    });
    expect(response.body.data).toHaveLength(1);
    expectSafeUser(response.body.data[0], first.email);
    expect(response.body.data[0]).toMatchObject({
      id: first.id,
      role: 'OPERADOR',
    });
  });

  it('exige status booleano e rejeita alteração de senha e perfil no PUT', async () => {
    const { id } = await createOperador();
    const path = `${base}/${id}`;
    await authorized('put', path).send(changes).expect(400);
    await authorized('put', path)
      .send({ ...changes, status: 'false' })
      .expect(400);
    await authorized('put', path)
      .send({ ...changes, status: true, password: 'outra' })
      .expect(400);
    await authorized('put', path)
      .send({ ...changes, status: true, role: 'ADMINISTRADOR' })
      .expect(400);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id } }),
    ).toMatchObject({
      email: body.email,
      name: body.name,
      status: true,
      role: 'OPERADOR',
    });
  });

  it('edita com status explícito e inativa sem apagar o registro', async () => {
    const { id } = await createOperador();
    const path = `${base}/${id}`;
    const original = await prisma.user.findUniqueOrThrow({ where: { id } });
    for (const status of [false, true]) {
      const response = await authorized('put', path)
        .send({ ...changes, status })
        .expect(200);
      expectSafeUser(response.body, changes.email);
      expect(response.body).toMatchObject({
        ...changes,
        status,
        role: 'OPERADOR',
      });
    }
    const response = await authorized('delete', path).expect(200);
    expect(response.body).toEqual({ id });
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id } }),
    ).toMatchObject({
      ...changes,
      status: false,
      role: 'OPERADOR',
      password: original.password,
    });
  });

  it('retorna 404 ao editar ou inativar um usuário de outro perfil', async () => {
    const target = await prisma.user.findFirstOrThrow({
      where: { role: 'ADMINISTRADOR' },
    });
    const path = `${base}/${target.id}`;
    await authorized('put', path)
      .send({ ...changes, status: false })
      .expect(404);
    await authorized('delete', path).expect(404);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: target.id } }),
    ).toEqual(target);
  });

  it.each(['OPERADOR', 'DESPACHANTE'])(
    'bloqueia as quatro rotas para %s',
    async (role) => {
      const target = await createOperador();
      const actor = { email: 'ator@example.com', password: body.password };
      await authorized('post', '/api/users')
        .send({ ...actor, name: 'Ator', role })
        .expect(201);
      const client = request(app.getHttpServer());
      const login = await client.post('/api/login').send(actor).expect(201);
      const bearer = `Bearer ${login.body.access_token}`;
      const path = `${base}/${target.id}`;
      await client
        .post(base)
        .set('Authorization', bearer)
        .send(body)
        .expect(403);
      await client.get(base).set('Authorization', bearer).expect(403);
      await client
        .put(path)
        .set('Authorization', bearer)
        .send({ ...changes, status: false })
        .expect(403);
      await client.delete(path).set('Authorization', bearer).expect(403);
    },
  );
});
