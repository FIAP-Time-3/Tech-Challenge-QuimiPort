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

  describe('login', () => {
    it('procura username sem diferenciar maiúsculas e emite tokens', async () => {
      const user = {
        id: 8,
        username: 'Bruno',
        password: 'hash',
        roles: ['OPERADOR'],
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
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(1, {
        id: 8,
        username: 'Bruno',
        roles: ['OPERADOR'],
      });
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { id: 8 },
        { expiresIn: '7d' },
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
      });

      await expect(
        service.login({ username: 'Bruno', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('valida refresh token, procura usuário e emite novos tokens', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ id: 8 });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 8,
        username: 'Bruno',
        roles: ['OPERADOR'],
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
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(1, {
        id: 8,
        username: 'Bruno',
        roles: ['OPERADOR'],
      });
      expect(jwtMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { id: 8 },
        { expiresIn: '7d' },
      );
    });

    it('recusa token inválido ou expirado', async () => {
      jwtMock.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(
        service.refresh({ refresh_token: 'expired' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it.each([null, {}, { id: 0 }])(
      'recusa payload sem id válido: %s',
      async (decoded) => {
        jwtMock.verifyAsync.mockResolvedValue(decoded);

        await expect(
          service.refresh({ refresh_token: 'invalid' }),
        ).rejects.toThrow(UnauthorizedException);
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      },
    );

    it('recusa refresh token de usuário inexistente', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ id: 99 });
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.refresh({ refresh_token: 'orphaned' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });
});
