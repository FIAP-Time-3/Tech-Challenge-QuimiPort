import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { SecurityModule } from '../../src/infra/security/security.module.js';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { DatabaseExceptionFilter } from '../../src/infra/filters/database-exception.filter.js';

let app: INestApplication<App>;
let prisma: PrismaService;
let adminToken: string;
const credentials = { email: 'Admin@example.com', password: 'secret' };
const userBody = {
  email: 'Bruno@example.com',
  name: 'Bruno Dias',
  password: 'secret',
  roles: ['OPERADOR'],
  status: true,
};

const updateBody = {
  email: userBody.email,
  name: userBody.name,
  roles: userBody.roles,
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
    for (const user of list.body) expectSafeUser(user, user.email);
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
