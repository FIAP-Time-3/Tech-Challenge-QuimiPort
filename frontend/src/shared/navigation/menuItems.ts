import { LayoutDashboard, Package, Ship, Users } from 'lucide-react';
import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';
import type { SideNavigationItem } from '@/shared/components/layout/SideNavigation';

const allRoles = Object.values(UserRole);

export function getMenuItems(
  location: { pathname: string; hash: string },
  role: UserRole | null,
): SideNavigationItem[] {
  if (!role) return [];

  type MenuItem = SideNavigationItem & { roles: readonly UserRole[] };
  type MenuChild = Extract<
    SideNavigationItem,
    { children: unknown }
  >['children'][number] & {
    roles: readonly UserRole[];
  };

  const items: (MenuItem & { children?: MenuChild[] })[] = [
    {
      label: 'Visão Geral',
      href: '/',
      icon: LayoutDashboard,
      roles: allRoles,
      active: location.pathname === '/' && !location.hash,
    },
    {
      label: 'Administração',
      icon: Users,
      roles: [UserRole.ADMINISTRADOR, UserRole.OPERADOR],
      children: [
        {
          label: 'Administradores',
          href: '/administracao/administradores',
          roles: [UserRole.ADMINISTRADOR],
          active: location.pathname === '/administracao/administradores',
        },
        {
          label: 'Operadores',
          href: '/administracao/operadores',
          roles: [UserRole.ADMINISTRADOR],
          active: location.pathname === '/administracao/operadores',
        },
        {
          label: 'Despachantes',
          href: '/administracao/despachantes',
          roles: [UserRole.ADMINISTRADOR, UserRole.OPERADOR],
          active: location.pathname === '/administracao/despachantes',
        },
      ],
    },
    {
      label: 'Produtos Químicos',
      href: '/produtos',
      icon: Package,
      roles: allRoles,
      active: location.pathname.startsWith('/produtos'),
    },
    {
      label: 'Cargas Químicas',
      href: '/#loads',
      icon: Ship,
      roles: allRoles,
      active: location.pathname === '/' && location.hash === '#loads',
    },
  ];

  const visibleItems: SideNavigationItem[] = [];
  for (const item of items) {
    if (!item.roles.includes(role)) continue;

    if (item.children) {
      const children = [];
      for (const child of item.children) {
        if (child.roles.includes(role)) children.push(child);
      }
      if (children.length) visibleItems.push({ ...item, children });
    } else {
      visibleItems.push(item);
    }
  }

  return visibleItems;
}
