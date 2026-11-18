import { RolesEnum } from '../enums/roles.enum.js';
import { AllowedRoles } from './allowedRoles.decorator.js';

describe('AllowedRoles', () => {
  it('armazena um perfil informado individualmente', () => {
    class Controller {}

    AllowedRoles(RolesEnum.ADMINISTRADOR)(Controller);

    expect(Reflect.getMetadata('role', Controller)).toEqual([
      RolesEnum.ADMINISTRADOR,
    ]);
  });
});
