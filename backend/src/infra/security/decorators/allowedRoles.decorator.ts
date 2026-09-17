// Use este decorator para definir qual ROLE o usuário precisa para executar a rota
// Rotas sem este decorator não irão validar ROLE
// Rotas sem este decorator ainda validam TOKEN

import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../enums/roles.enum.js';

export const AllowedRoles = (
  allowedRoles: RolesEnum[],
): MethodDecorator & ClassDecorator => {
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];

  return SetMetadata('roles', rolesArray);
};
