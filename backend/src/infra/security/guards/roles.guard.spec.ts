import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from '../decorators/allowed-roles.decorator.js';
import { SetPublic } from '../decorators/set-public.decorator.js';
import { RolesEnum } from '../enums/roles.enum.js';
import { RolesGuard } from './roles.guard.js';

function setup({
  publicRoute = false,
  handlerRoles = [],
  classRoles = [],
  userRole,
  noRoleMetadata = false,
}: {
  publicRoute?: boolean;
  handlerRoles?: RolesEnum[];
  classRoles?: RolesEnum[];
  userRole?: RolesEnum;
  noRoleMetadata?: boolean;
} = {}) {
  class Controller {
    handler() {}
  }
  const handler = Controller.prototype.handler;
  if (!noRoleMetadata) {
    AllowedRoles(classRoles)(Controller);
    AllowedRoles(handlerRoles)(
      Controller.prototype,
      'handler',
      Object.getOwnPropertyDescriptor(Controller.prototype, 'handler')!,
    );
  }
  if (publicRoute) SetPublic()(Controller);
  const context = {
    getHandler: () => handler,
    getClass: () => Controller,
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: userRole } }),
    }),
  } as unknown as ExecutionContext;
  const guard = new RolesGuard(new Reflector());

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

  it('permite rota sem metadata de perfis', () => {
    const { guard, context } = setup({ noRoleMetadata: true });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite quando usuário possui perfil exigido pelo handler', () => {
    const { guard, context } = setup({
      handlerRoles: [RolesEnum.ADMINISTRADOR],
      userRole: RolesEnum.ADMINISTRADOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite quando o perfil exigido está somente no controller', () => {
    const { guard, context } = setup({
      classRoles: [RolesEnum.OPERADOR],
      userRole: RolesEnum.OPERADOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('considera perfis declarados no controller e no handler', () => {
    const { guard, context } = setup({
      classRoles: [RolesEnum.ADMINISTRADOR],
      handlerRoles: [RolesEnum.OPERADOR],
      userRole: RolesEnum.OPERADOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deduplica perfis repetidos sem negar acesso', () => {
    const { guard, context } = setup({
      classRoles: [RolesEnum.OPERADOR],
      handlerRoles: [RolesEnum.OPERADOR],
      userRole: RolesEnum.OPERADOR,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('recusa usuário sem perfil permitido', () => {
    const { guard, context } = setup({
      handlerRoles: [RolesEnum.ADMINISTRADOR],
      userRole: RolesEnum.OPERADOR,
    });

    expect(guard.canActivate(context)).toBe(false);
  });
});
