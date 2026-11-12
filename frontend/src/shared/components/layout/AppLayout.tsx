import {
  Activity,
  FlaskConical,
  LayoutDashboard,
  Package,
  Ship,
} from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useCurrentUser } from '@/modules/auth/hooks/useCurrentUser';
import { logout } from '@/modules/auth/use-cases/logout';
import SideNavigation from './SideNavigation';
import PageHeader from './PageHeader';
import { MainContent } from './MainContent';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
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
  const current = items.find((item) => item.active)?.label ?? 'Plataforma';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-svh bg-muted/50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-background focus:p-3"
      >
        Ir para o conteúdo
      </a>
      <SideNavigation
        brand="QuimiPort"
        description="gestão portuária"
        brandIcon={FlaskConical}
        items={items}
        mobileOpen={menuOpen}
        onMobileClose={() => setMenuOpen(false)}
      />
      <div className="flex min-h-svh min-w-0 flex-col lg:pl-64">
        <PageHeader
          breadcrumb={`QuimiPort / ${current}`}
          title={current}
          user={user}
          onLogout={handleLogout}
          onMenuOpen={() => setMenuOpen(true)}
          menuOpen={menuOpen}
        />
        <MainContent>
          <Outlet />
        </MainContent>
        <footer className="mx-auto w-full max-w-[1440px] px-4 pb-5 text-xs text-muted-foreground sm:px-8">
          QuimiPort · Gestão segura de operações químicas
        </footer>
      </div>
    </div>
  );
}
