import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../src/infra/database/prisma.service.js';
import { UserService } from '../../src/infra/security/user/application/user.service.js';
import { LoginService } from '../../src/infra/security/login/application/login.service.js';
import { PasswordService } from '../../src/infra/security/password/password.service.js';
import { RolesEnum } from '../../src/infra/security/enums/roles.enum.js';
import { configureTestDatabase } from '../support/database-env.js';

const prisma = new PrismaService();
const users = new UserService(prisma);
const jwt = new JwtService({ secret: 'integration-test-secret' });
const login = new LoginService(prisma, jwt);
const body = {
  name: 'Bruno Dias',
  email: 'Bruno@example.com',
  password: 'secret',
  role: RolesEnum.OPERADOR,
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
      INSERT INTO "User" (name, email, password, role) VALUES ('Teste', NULL, 'hash', 'OPERADOR')
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
        role: RolesEnum.ADMINISTRADOR,
      },
    });
    const user = await users.create({ body });
    await users.update({
      id: user.id,
      body: {
        name: body.name,
        email: 'novo@example.com',
        role: body.role,
        status: body.status,
      },
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

  it.each([
    ['remover', 'remover'],
    ['desativar', 'desativar'],
    ['rebaixar', 'rebaixar'],
    ['remover', 'rebaixar'],
    ['desativar', 'remover'],
  ] as const)(
    'mantém um administrador ativo ao %s e %s simultaneamente',
    async (firstAction, secondAction) => {
      const adminData = { ...body, role: RolesEnum.ADMINISTRADOR };
      const first = await prisma.user.create({
        data: { ...adminData, email: 'primeiro@example.com' },
      });
      const second = await prisma.user.create({
        data: { ...adminData, email: 'segundo@example.com' },
      });

      function apply(
        action: 'remover' | 'desativar' | 'rebaixar',
        user: typeof first,
      ) {
        if (action === 'remover') return users.remove({ id: user.id });
        return users.update({
          id: user.id,
          body: {
            email: user.email,
            name: user.name,
            role:
              action === 'rebaixar'
                ? RolesEnum.OPERADOR
                : RolesEnum.ADMINISTRADOR,
            status: action !== 'desativar',
          },
        });
      }

      const results = await Promise.allSettled([
        apply(firstAction, first),
        apply(secondAction, second),
      ]);
      expect(
        results.filter(({ status }) => status === 'fulfilled'),
      ).toHaveLength(1);
      expect(results).toContainEqual({
        status: 'rejected',
        reason: expect.any(BadRequestException),
      });
      const remaining = await prisma.user.findMany({
        where: { role: RolesEnum.ADMINISTRADOR, status: true },
      });
      expect(remaining).toHaveLength(1);
      expect([first.id, second.id]).toContain(remaining[0]?.id);
    },
  );
});

describe('Seed do primeiro administrador', () => {
  const seedCredentials = {
    name: 'Admin Inicial',
    email: 'admin-seed@example.com',
    password: 'senha-exclusiva-do-seed',
  };

  const runCommand = promisify(execFile);

  beforeAll(async () => {
    await runCommand('npm', ['run', 'build']);
  }, 30000);

  async function runSeed({ name, email, password } = seedCredentials) {
    const url = configureTestDatabase();
    const database = new URL(url);
    await runCommand(
      process.execPath,
      ['--import', 'dotenv/config', 'dist/infra/security/user/seed-admin.js'],
      {
        timeout: 10000,
        env: {
          ...process.env,
          DATABASE_URL: url,
          DATABASE_HOSTNAME: database.hostname,
          DATABASE_PORT: database.port || '5432',
          DATABASE_NAME: database.pathname.slice(1),
          DATABASE_USERNAME: decodeURIComponent(database.username),
          DATABASE_PASSWORD: decodeURIComponent(database.password),
          SEED_ADMIN_NAME: name,
          SEED_ADMIN_EMAIL: email,
          SEED_ADMIN_PASSWORD: password,
        },
      },
    );
  }

  it('cria um administrador ativo em banco limpo com senha válida para login', async () => {
    await runSeed();
    const rows = await prisma.user.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      name: seedCredentials.name,
      email: seedCredentials.email,
      role: RolesEnum.ADMINISTRADOR,
      status: true,
    });
    expect(rows[0]?.password).not.toBe(seedCredentials.password);
    await expect(login.login(seedCredentials)).resolves.toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });

  it('pode ser reexecutado sem duplicar nem alterar o administrador existente', async () => {
    await runSeed();
    const original = await prisma.user.findUniqueOrThrow({
      where: { email: seedCredentials.email },
    });

    await runSeed({ ...seedCredentials, password: 'outra-senha-do-seed' });

    expect(await prisma.user.findMany()).toEqual([original]);
  });

  it('recusa credenciais incompletas sem criar usuário', async () => {
    await expect(
      runSeed({ ...seedCredentials, password: '' }),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        'Informe SEED_ADMIN_NAME, SEED_ADMIN_EMAIL válido e SEED_ADMIN_PASSWORD.',
      ),
    });
    expect(await prisma.user.count()).toBe(0);
  });
});
