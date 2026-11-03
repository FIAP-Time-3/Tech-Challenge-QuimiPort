import { RolesEnum } from '../enums/roles.enum.js';
import { AllowedRoles } from './allowedRoles.decorator.js';

describe('AllowedRoles', () => {
  it('armazena um perfil informado individualmente', () => {
    class Controller {}

    AllowedRoles(RolesEnum.ADMINISTRADOR)(Controller);

    expect(Reflect.getMetadata('roles', Controller)).toEqual([
      RolesEnum.ADMINISTRADOR,
    ]);
  });

  it('preserva múltiplos perfis permitidos', () => {
    class Controller {}
    const roles = [RolesEnum.GESTOR, RolesEnum.OPERADOR];

    AllowedRoles(roles)(Controller);

    expect(Reflect.getMetadata('roles', Controller)).toEqual(roles);
  });
});
