import {
  ExecutionContext,
  PreconditionFailedException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service.js';
import { AuthGuard } from './auth.guard.js';

function createContext(request: {
  headers: { authorization?: string };
  user?: unknown;
}): ExecutionContext {
  return {
    getHandler: () => createContext,
    getClass: () => AuthGuard,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function setup(publicRoute = false) {
  const request: { headers: { authorization?: string }; user?: unknown } = {
    headers: {},
  };
  const prismaMock = {
    user: {
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn(),
    },
  };
  const jwtMock = { verifyAsync: vi.fn() };
  const reflectorMock = {
    get: vi.fn((key: string) => key === 'isPublic' && publicRoute),
  };
  const guard = new AuthGuard(
    reflectorMock as unknown as Reflector,
    prismaMock as unknown as PrismaService,
    jwtMock as unknown as JwtService,
  );

  return { guard, request, prismaMock, jwtMock };
}

describe('AuthGuard', () => {
  it('permite rota pública sem consultar usuários ou token', async () => {
    const { guard, request, prismaMock, jwtMock } = setup(true);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(prismaMock.user.count).not.toHaveBeenCalled();
    expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('exige usuário ativo inicial antes de autenticar', async () => {
    const { guard, request, prismaMock, jwtMock } = setup();
    prismaMock.user.count.mockResolvedValue(0);

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      PreconditionFailedException,
    );
    expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('recusa requisição sem token', async () => {
    const { guard, request } = setup();

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it.each(['Basic token', 'Bearer', 'bearer token'])(
    'recusa cabeçalho de autorização inválido: %s',
    async (authorization) => {
      const { guard, request, jwtMock } = setup();
      request.headers.authorization = authorization;

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtMock.verifyAsync).not.toHaveBeenCalled();
    },
  );

  it('recusa token inválido ou expirado', async () => {
    const { guard, request, jwtMock, prismaMock } = setup();
    request.headers.authorization = 'Bearer invalid';
    jwtMock.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
  });

  it.each([null, { id: 7, status: false }])(
    'recusa token associado a %s',
    async (user) => {
      const { guard, request, jwtMock, prismaMock } = setup();
      request.headers.authorization = 'Bearer valid';
      jwtMock.verifyAsync.mockResolvedValue({ id: 7, iat: 10, exp: 20 });
      prismaMock.user.findFirst.mockResolvedValue(user);

      await expect(guard.canActivate(createContext(request))).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it('anexa dados atuais do usuário à requisição autenticada', async () => {
    const { guard, request, jwtMock, prismaMock } = setup();
    request.headers.authorization = 'Bearer valid';
    jwtMock.verifyAsync.mockResolvedValue({ id: 7, iat: 10, exp: 20 });
    prismaMock.user.findFirst.mockResolvedValue({
      id: 7,
      username: 'bruno',
      roles: ['OPERADOR'],
      status: true,
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 7,
      username: 'bruno',
      roles: ['OPERADOR'],
      iat: 10,
      exp: 20,
    });
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: 7 },
    });
  });
});
