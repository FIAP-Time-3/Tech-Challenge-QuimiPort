import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';
import { LoginService } from './Login.service.js';

describe('LoginService', () => {
  let service: LoginService;

  const prismaMock = {
    user: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  const jwtMock = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };
  let comparePassword: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('JWT_ACCESS_TOKEN_MINUTES', '60');
    vi.stubEnv('JWT_REFRESH_TOKEN_MINUTES', '4320');
    vi.restoreAllMocks();
    vi.resetAllMocks();
    comparePassword = vi
      .spyOn(PasswordService, 'compare')
      .mockResolvedValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    [0, true],
    [1, false],
  ])(
    'consulta configuração inicial com %s administradores',
    async (count, requiresSetup) => {
      prismaMock.user.count.mockResolvedValue(count);
      await expect(service.getSetup()).resolves.toEqual({ requiresSetup });
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: { roles: { has: 'ADMINISTRADOR' }, status: true },
      });
    },
  );

  describe('login', () => {
    it('procura username sem diferenciar maiúsculas e emite tokens', async () => {
      const user = {
        id: 8,
        username: 'Bruno',
        password: 'hash',
        roles: ['OPERADOR'],
        status: true,
      };
      prismaMock.user.findFirst.mockResolvedValue(user);
      comparePassword.mockResolvedValue(true);
      jwtMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await expect(
        service.login({ username: 'BRUNO', password: 'senha' }),
      ).resolves.toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: {
          username: { equals: 'BRUNO', mode: 'insensitive' },
        },
      });
      expect(PasswordService.compare).toHaveBeenCalledWith({
        hash: 'hash',
        password: 'senha',
      });
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          id: 8,
          username: 'Bruno',
          roles: ['OPERADOR'],
          token_use: 'access',
        },
        { expiresIn: 3600, jwtid: expect.any(String) },
      );
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { id: 8, token_use: 'refresh' },
        { expiresIn: 259200, jwtid: expect.any(String) },
      );
    });

    it('recusa username inexistente sem comparar senha', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ username: 'ausente', password: 'senha' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(comparePassword).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('recusa senha incorreta', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 8,
        username: 'Bruno',
        password: 'hash',
        roles: ['OPERADOR'],
        status: true,
      });

      await expect(
        service.login({ username: 'Bruno', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('recusa usuário inativo sem comparar senha ou emitir tokens', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 8,
        username: 'Bruno',
        password: 'hash',
        roles: ['OPERADOR'],
        status: false,
      });

      await expect(
        service.login({ username: 'Bruno', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(comparePassword).not.toHaveBeenCalled();
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('valida refresh token, procura usuário e emite novos tokens', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ id: 8, token_use: 'refresh' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 8,
        username: 'Bruno',
        roles: ['OPERADOR'],
        status: true,
      });
      jwtMock.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      await expect(
        service.refresh({ refresh_token: 'old-refresh' }),
      ).resolves.toEqual({
        access_token: 'new-access',
        refresh_token: 'new-refresh',
      });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 8 },
      });
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          id: 8,
          username: 'Bruno',
          roles: ['OPERADOR'],
          token_use: 'access',
        },
        { expiresIn: 3600, jwtid: expect.any(String) },
      );
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { id: 8, token_use: 'refresh' },
        { expiresIn: 259200, jwtid: expect.any(String) },
      );
    });

    it('recusa token inválido ou expirado', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(
        service.refresh({ refresh_token: 'expired' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it.each([
      null,
      {},
      { id: 0 },
      { id: 8 },
      { id: 8, token_use: 'access' },
      { id: -1, token_use: 'refresh' },
      { id: '8', token_use: 'refresh' },
    ])('recusa payload sem id válido: %s', async (decoded) => {
      jwtMock.verifyAsync.mockResolvedValue(decoded);

      await expect(
        service.refresh({ refresh_token: 'invalid' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('recusa refresh token de usuário inexistente', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ id: 99, token_use: 'refresh' });
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh({ refresh_token: 'orphaned' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });

    it('recusa refresh token de usuário inativo', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ id: 8, token_use: 'refresh' });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 8,
        username: 'Bruno',
        roles: ['OPERADOR'],
        status: false,
      });

      await expect(
        service.refresh({ refresh_token: 'old-refresh' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
