import { useCurrentUser } from '@/modules/auth/services/currentUser';
import { FlaskConical, LayoutDashboard, Package } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { logout } from '@/modules/auth/use-cases/logout';
import PageHeader from '@/shared/components/layout/PageHeader';
import SideNavigation from '@/shared/components/layout/SideNavigation';

function ChemicalProductsLayout() {
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isProductsPage = location.pathname.startsWith('/produtos');
  const isCreatePage = location.pathname === '/produtos/novo';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-svh bg-muted/50">
      <SideNavigation
        brand="QuimiPort"
        description="gestão portuária"
        brandHref="/"
        brandIcon={FlaskConical}
        items={[
          {
            label: 'Visão geral',
            href: '/',
            icon: LayoutDashboard,
          },
          {
            label: 'Produtos químicos',
            href: '/produtos',
            icon: Package,
            active: isProductsPage,
          },
        ]}
      />
      <div className="lg:pl-64">
        <PageHeader
          breadcrumb="QuimiPort / Produtos químicos"
          title={
            isProductsPage
              ? isCreatePage
                ? 'Cadastro de produto'
                : location.pathname === '/produtos'
                  ? 'Produtos químicos'
                  : 'Edição de produto'
              : 'Produtos químicos'
          }
          user={user}
          onLogout={handleLogout}
        />
        <main className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ChemicalProductsLayout;
