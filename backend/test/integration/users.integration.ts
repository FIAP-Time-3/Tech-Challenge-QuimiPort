import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { UserService } from '../../src/infra/security/user/application/User.service.js';
import { LoginService } from '../../src/infra/security/login/application/Login.service.js';
import { PasswordService } from '../../src/infra/security/password/password.service.js';
import { RolesEnum } from '../../src/infra/security/enums/roles.enum.js';

const prisma = new PrismaService();
const users = new UserService(prisma);
const jwt = new JwtService({ secret: 'integration-test-secret' });
const login = new LoginService(prisma, jwt);
const body = {
  name: 'Bruno Dias',
  email: 'Bruno@example.com',
  password: 'secret',
  roles: [RolesEnum.OPERADOR],
  status: true,
};

beforeAll(async () => {
  await prisma.$connect();
});
afterAll(async () => {
  await prisma.$disconnect();
});
beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe('Usuários com PostgreSQL real', () => {
  it('aplica as migrations sem username, com email obrigatório e citext', async () => {
    const columns = await prisma.$queryRaw<
      Array<{ column_name: string; udt_name: string; is_nullable: string }>
    >`
      SELECT column_name, udt_name, is_nullable FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'`;
    expect(columns.some((c) => c.column_name === 'username')).toBe(false);
    expect(columns).toContainEqual(
      expect.objectContaining({
        column_name: 'email',
        udt_name: 'citext',
        is_nullable: 'NO',
      }),
    );
  });

  it('cria usuário sem username e armazena hash verdadeiro', async () => {
    const result = await users.create({ body });
    const stored = await prisma.user.findUniqueOrThrow({
      where: { id: result.id },
    });
    expect(result.email).toBe(body.email);
    expect(result).not.toHaveProperty('username');
    expect(result.password).toBeUndefined();
    expect(JSON.parse(JSON.stringify(result))).not.toHaveProperty('password');
    expect(stored.password).not.toBe(body.password);
    expect(
      await PasswordService.compare({
        password: body.password,
        hash: stored.password,
      }),
    ).toBe(true);
  });

  it('busca com caixa diferente e preserva o email original', async () => {
    await users.create({ body });
    const found = await prisma.user.findUniqueOrThrow({
      where: { email: 'BRUNO@EXAMPLE.COM' },
    });
    expect(found.email).toBe(body.email);
  });

  it('recusa duplicidade no serviço sem diferenciar caixa', async () => {
    await users.create({ body });
    await expect(
      users.create({ body: { ...body, email: 'BRUNO@EXAMPLE.COM' } }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('garante unicidade diretamente no banco', async () => {
    await prisma.user.create({ data: body });
    await expect(
      prisma.user.create({ data: { ...body, email: 'BRUNO@EXAMPLE.COM' } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('recusa email nulo diretamente no banco', async () => {
    await expect(prisma.$executeRaw`
      INSERT INTO "User" (name, email, password, roles) VALUES ('Teste', NULL, 'hash', ARRAY[]::text[])
    `).rejects.toMatchObject({
      code: 'P2010',
      meta: {
        driverAdapterError: {
          cause: { kind: 'NullConstraintViolation', originalCode: '23502' },
        },
      },
    });
  });

  it('permite apenas uma inserção simultânea do mesmo email', async () => {
    const results = await Promise.allSettled([
      prisma.user.create({ data: body }),
      prisma.user.create({ data: { ...body, email: 'BRUNO@EXAMPLE.COM' } }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(await prisma.user.count()).toBe(1);
  });

  it('recusa atualização que conflita com outro email', async () => {
    await prisma.user.create({ data: body });
    const other = await prisma.user.create({
      data: { ...body, email: 'other@example.com' },
    });
    await expect(
      prisma.user.update({
        where: { id: other.id },
        data: { email: 'BRUNO@EXAMPLE.COM' },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: other.id } })).email,
    ).toBe('other@example.com');
  });

  it('autentica por email com caixa diferente e emite tokens sem username', async () => {
    const user = await users.create({ body });
    const tokens = await login.login({
      email: 'BRUNO@EXAMPLE.COM',
      password: body.password,
    });
    const access = await jwt.verifyAsync(tokens.access_token);
    expect(access).toMatchObject({
      id: user.id,
      email: body.email,
      token_use: 'access',
    });
    expect(access).not.toHaveProperty('username');
    expect(await jwt.verifyAsync(tokens.refresh_token)).toMatchObject({
      id: user.id,
      token_use: 'refresh',
    });
    const refreshed = await login.refresh({
      refresh_token: tokens.refresh_token,
    });
    expect(await jwt.verifyAsync(refreshed.access_token)).toMatchObject({
      id: user.id,
      email: body.email,
    });
  });

  it.each([
    ['email inexistente', 'missing@example.com', 'secret', true],
    ['senha errada', 'Bruno@example.com', 'wrong', true],
    ['usuário inativo', 'Bruno@example.com', 'secret', false],
  ])('recusa login: %s', async (_, email, password, status) => {
    await users.create({ body: { ...body, status } });
    await expect(login.login({ email, password })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('troca email e autentica somente com o novo identificador', async () => {
    await users.create({
      body: {
        ...body,
        email: 'admin@example.com',
        roles: [RolesEnum.ADMINISTRADOR],
      },
    });
    const user = await users.create({ body });
    await users.update({
      id: user.id,
      body: { ...body, email: 'novo@example.com' },
    });
    await expect(
      login.login({ email: body.email, password: body.password }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    const tokens = await login.login({
      email: 'NOVO@EXAMPLE.COM',
      password: body.password,
    });
    expect(await jwt.verifyAsync(tokens.access_token)).toMatchObject({
      id: user.id,
      email: 'novo@example.com',
    });
  });

  it('serializa o cadastro simultâneo do administrador inicial', async () => {
    const results = await Promise.allSettled([
      users.createFirst({ body: { ...body, email: 'admin1@example.com' } }),
      users.createFirst({ body: { ...body, email: 'admin2@example.com' } }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await prisma.user.count()).toBe(1);
  });
});
