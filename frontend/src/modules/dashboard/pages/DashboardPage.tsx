import {
  ArrowDownToLine,
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  Ship,
  CircleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { logout } from '@/modules/auth/use-cases/logout';
import { listCargas } from '@/modules/dashboard/use-cases/listarCargas';
import {
  capacityWarning,
  metrics,
  movements,
  terminalCapacity,
} from '@/infrastructure/mocks/dashboard';
import ActivityChartCard from '@/shared/components/data-display/ActivityChartCard';
import CapacityCard from '@/shared/components/data-display/CapacityCard';
import type { MetricItem } from '@/shared/components/data-display/MetricGrid';
import MetricGrid from '@/shared/components/data-display/MetricGrid';
import PageHeader from '@/shared/components/layout/PageHeader';
import PageWelcome from '@/shared/components/layout/PageWelcome';
import SideNavigation from '@/shared/components/layout/SideNavigation';
import { Button } from '@/shared/components/ui/button';
import RecentLoadsTable from '@/modules/dashboard/components/RecentLoadsTable';

const metricIcons = {
  loads: { icon: Ship, tone: 'bg-primary/10 text-primary' },
  products: { icon: FlaskConical, tone: 'bg-chart-2/15 text-chart-2' },
  volume: { icon: Boxes, tone: 'bg-chart-3/20 text-amber-700' },
  attention: { icon: CircleAlert, tone: 'bg-destructive/10 text-destructive' },
};

const dashboardMetrics: MetricItem[] = metrics.map((metric) => ({
  label: metric.label,
  value: metric.value,
  change: metric.change,
  detail: metric.detail,
  ...metricIcons[metric.type],
}));

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
      <SideNavigation
        brand="QuimiPort"
        description="gestão portuária"
        brandHref="#overview"
        brandIcon={FlaskConical}
        items={[
          {
            label: 'Visão geral',
            href: '#overview',
            icon: LayoutDashboard,
            active: true,
          },
          { label: 'Cargas', href: '#loads', icon: Ship, badge: '12' },
          { label: 'Produtos', href: '/produtos', icon: FlaskConical },
        ]}
        status={{
          title: 'Sistema operacional',
          description: 'Dados sincronizados há poucos minutos.',
        }}
      />
      <div className="lg:pl-64">
        <PageHeader
          breadcrumb="QuimiPort / Operações"
          title="Visão geral"
          user={{ name: 'Marina Costa', role: 'Operações', initials: 'MC' }}
          onLogout={handleLogout}
        />
        <main
          id="overview"
          className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8"
        >
          <PageWelcome
            date="Quarta-feira, 11 de novembro de 2026"
            greeting="Bom dia, Marina"
            description="Aqui está o resumo das operações do seu terminal."
            actions={
              <>
                <Button variant="outline" className="bg-background">
                  <ArrowDownToLine aria-hidden="true" />
                  <span className="hidden sm:inline">Exportar relatório</span>
                  <span className="sm:hidden">Exportar</span>
                </Button>
                <Button>
                  <ClipboardList aria-hidden="true" />
                  Nova carga
                </Button>
              </>
            }
          />
          <MetricGrid
            items={dashboardMetrics}
            label="Indicadores operacionais"
          />
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
            <ActivityChartCard
              title="Movimentação de cargas"
              description="Volume de operações nos últimos 7 dias"
              periodLabel="Esta semana"
              data={movements.map(({ day, value }) => ({
                label: day,
                value,
              }))}
              highlightIndex={3}
              trend={{
                value: '12,5%',
                description: 'em comparação à semana anterior',
              }}
            />
            <CapacityCard
              title="Capacidade do terminal"
              description="Ocupação atual por área de armazenamento"
              items={terminalCapacity}
              warning={capacityWarning}
            />
          </section>
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
