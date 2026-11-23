import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';

const admin = UserRole.ADMINISTRADOR;

export const administrationSections = [
  {
    label: 'Administradores',
    href: '/administracao/administradores',
    role: admin,
    allowedRoles: [admin],
  },
  {
    label: 'Operadores',
    href: '/administracao/operadores',
    role: UserRole.OPERADOR,
    allowedRoles: [admin],
  },
  {
    label: 'Despachantes',
    href: '/administracao/despachantes',
    role: UserRole.DESPACHANTE,
    allowedRoles: [admin, UserRole.OPERADOR],
  },
] satisfies {
  label: string;
  href: string;
  role: UserRole;
  allowedRoles: UserRole[];
}[];
