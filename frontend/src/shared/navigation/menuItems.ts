import { LayoutDashboard, Package, Ship, Activity } from 'lucide-react';
import type { SideNavigationItem } from '@/shared/components/layout/SideNavigation';

export function getMenuItems(location: {
  pathname: string;
  hash: string;
}): SideNavigationItem[] {
  return [
    {
      label: 'Visão geral',
      href: '/',
      icon: LayoutDashboard,
      active: location.pathname === '/' && !location.hash,
    },
    {
      label: 'Cargas',
      href: '/#loads',
      icon: Ship,
      active: location.pathname === '/' && location.hash === '#loads',
    },
    {
      label: 'Produtos químicos',
      href: '/produtos',
      icon: Package,
      active: location.pathname.startsWith('/produtos'),
    },
    { label: 'Status do sistema', href: '/health', icon: Activity },
  ];
}
