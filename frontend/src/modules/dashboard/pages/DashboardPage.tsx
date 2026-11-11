import { useState } from 'react';
import { useNavigate } from 'react-router';
import { logout } from '@/modules/auth/use-cases/logout';
import { listCargas } from '@/modules/dashboard/use-cases/listarCargas';
import DashboardHeader from '@/modules/dashboard/components/DashboardHeader';
import DashboardSidebar from '@/modules/dashboard/components/DashboardSidebar';
import DashboardWelcome from '@/modules/dashboard/components/DashboardWelcome';
import MetricsGrid from '@/modules/dashboard/components/MetricsGrid';
import OperationsCharts from '@/modules/dashboard/components/OperationsCharts';
import RecentLoadsTable from '@/modules/dashboard/components/RecentLoadsTable';

function DashboardPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const recentLoads = listCargas();
  const normalizedSearch = search.toLocaleLowerCase('pt-BR');
  const filteredLoads = recentLoads.filter((load) =>
    `${load.code} ${load.product} ${load.origin} ${load.status}`
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedSearch),
  );

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-svh bg-muted/50">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardHeader onLogout={handleLogout} />
        <main
          id="overview"
          className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8"
        >
          <DashboardWelcome />
          <MetricsGrid />
          <OperationsCharts />
          <RecentLoadsTable
            loads={filteredLoads}
            totalLoads={recentLoads.length}
            search={search}
            onSearchChange={setSearch}
          />
          <footer className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
            <span>QuimiPort · Gestão segura de operações químicas</span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Atualizado agora
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
