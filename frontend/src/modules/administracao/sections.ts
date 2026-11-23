import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';

const admin = UserRole.ADMINISTRADOR;

export const administrationSections = [
  {
    label: 'Administradores',
    href: '/administracao/administradores',
    role: admin,
  },
  {
    label: 'Operadores',
    href: '/administracao/operadores',
    role: UserRole.OPERADOR,
  },
  {
    label: 'Despachantes',
    href: '/administracao/despachantes',
    role: UserRole.DESPACHANTE,
  },
] satisfies {
  label: string;
  href: string;
  role: UserRole;
}[];
