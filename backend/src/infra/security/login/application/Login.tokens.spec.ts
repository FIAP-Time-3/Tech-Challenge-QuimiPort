import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { PrismaService } from '../../../database/prisma.service.js';
import configurations from '../../../configurations/configurations.js';
import { AuthGuard } from '../../guards/auth.guard.js';
import { PasswordService } from '../../password/password.service.js';
import { LoginService } from './Login.service.js';

describe('JWTs de acesso e renovação', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('usa os prazos padrão e recusa configuração inválida', () => {
    vi.stubEnv('JWT_ACCESS_TOKEN_MINUTES', undefined);
    vi.stubEnv('JWT_REFRESH_TOKEN_MINUTES', undefined);
    expect(configurations().jwt).toMatchObject({
      accessTokenMinutes: 60,
      refreshTokenMinutes: 4320,
    });
    for (const value of ['0', '-1', 'abc', '1.5', '']) {
      vi.stubEnv('JWT_ACCESS_TOKEN_MINUTES', value);
      expect(() => configurations()).toThrow('JWT_ACCESS_TOKEN_MINUTES');
    }
    vi.stubEnv('JWT_ACCESS_TOKEN_MINUTES', '60');
    vi.stubEnv('JWT_REFRESH_TOKEN_MINUTES', '0');
    expect(() => configurations()).toThrow('JWT_REFRESH_TOKEN_MINUTES');
  });

  it('emite e renova ambos com os prazos configurados e separa suas finalidades', async () => {
    vi.stubEnv('JWT_ACCESS_TOKEN_MINUTES', '2');
    vi.stubEnv('JWT_REFRESH_TOKEN_MINUTES', '10');
    const jwt = new JwtService({ secret: 'test-only-secret' });
    const user = {
      id: 1,
      username: 'admin',
      roles: ['ADMINISTRADOR'],
      status: true,
      password: 'hash',
    };
    const prisma = {
      user: {
        count: vi.fn().mockResolvedValue(1),
        findFirst: vi.fn().mockResolvedValue(user),
        findUnique: vi.fn().mockResolvedValue(user),
      },
    } as unknown as PrismaService;
    vi.spyOn(PasswordService, 'compare').mockResolvedValue(true);
    const service = new LoginService(prisma, jwt);
    const initial = await service.login({
      username: 'admin',
      password: 'password',
    });
    const renewed = await service.refresh({
      refresh_token: initial.refresh_token,
    });
    expect(renewed.access_token).not.toBe(initial.access_token);
    expect(renewed.refresh_token).not.toBe(initial.refresh_token);
    for (const pair of [initial, renewed]) {
      const access = await jwt.verifyAsync(pair.access_token);
      const refresh = await jwt.verifyAsync(pair.refresh_token);
      expect(access.token_use).toBe('access');
      expect(access.exp - access.iat).toBe(120);
      expect(refresh.token_use).toBe('refresh');
      expect(refresh.exp - refresh.iat).toBe(600);
    }
    await expect(
      service.refresh({ refresh_token: initial.access_token }),
    ).rejects.toThrow(UnauthorizedException);
    const expired = await jwt.signAsync(
      { id: 1, token_use: 'refresh' },
      { expiresIn: -1 },
    );
    await expect(service.refresh({ refresh_token: expired })).rejects.toThrow(
      UnauthorizedException,
    );
    const guard = new AuthGuard(
      { get: () => false } as unknown as Reflector,
      prisma,
      jwt,
    );
    const request = {
      headers: { authorization: `Bearer ${initial.refresh_token}` },
    };
    const context = {
      getHandler: () => service.login,
      getClass: () => LoginService,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    request.headers.authorization = `Bearer ${initial.access_token}`;
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
