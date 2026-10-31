import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from '../enums/roles.enum.js';
import { RolesGuard } from './roles.guard.js';

function setup({
  publicRoute = false,
  handlerRoles = [],
  classRoles = [],
  userRoles = [],
}: {
  publicRoute?: boolean;
  handlerRoles?: RolesEnum[];
  classRoles?: RolesEnum[];
  userRoles?: RolesEnum[];
} = {}) {
  const handler = {};
  const controller = {};
  const context = {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({ user: { roles: userRoles } }),
    }),
  } as unknown as ExecutionContext;
  const reflectorMock = {
    get: vi.fn((key: string, target: object) => {
      if (key === 'isPublic') return publicRoute;
      if (target === handler) return handlerRoles;
      if (target === controller) return classRoles;
      return undefined;
    }),
  };
  const guard = new RolesGuard(reflectorMock as unknown as Reflector);

  return { guard, context };
}

describe('RolesGuard', () => {
  it('permite rota pública sem validar perfil', () => {
    const { guard, context } = setup({ publicRoute: true });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite rota sem perfis restritos', () => {
    const { guard, context } = setup();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite quando usuário possui perfil exigido pelo handler', () => {
    const { guard, context } = setup({
      handlerRoles: [RolesEnum.ADMINISTRADOR],
      userRoles: [RolesEnum.ADMINISTRADOR],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('considera perfis declarados no controller e no handler', () => {
    const { guard, context } = setup({
      classRoles: [RolesEnum.ADMINISTRADOR],
      handlerRoles: [RolesEnum.GESTOR],
      userRoles: [RolesEnum.GESTOR],
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('recusa usuário sem perfil permitido', () => {
    const { guard, context } = setup({
      handlerRoles: [RolesEnum.ADMINISTRADOR],
      userRoles: [RolesEnum.OPERADOR],
    });

    expect(guard.canActivate(context)).toBe(false);
  });
});
