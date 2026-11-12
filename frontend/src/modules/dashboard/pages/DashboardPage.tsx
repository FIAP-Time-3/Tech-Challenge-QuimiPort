import { Title } from '@/shared/components/layout/Title';
import { Boxes, FlaskConical, Ship, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCurrentUser } from '@/modules/auth/services/currentUser';
import { cargaQuimicaApiRoutes } from '@/infrastructure/backend/routes/cargaQuimica.routes';
import { produtoQuimicoApiRoutes } from '@/infrastructure/backend/routes/produtoQuimico.routes';
import type { CargaQuimicaResponseDto } from '@/infrastructure/backend/dtos/cargaQuimica.dtos';
import {
  statusLabels,
  toDashboardLoad,
} from '@/modules/dashboard/services/cargaQuimica.service';
import ActivityChartCard from '@/shared/components/data-display/ActivityChartCard';
import MetricGrid, {
  type MetricItem,
} from '@/shared/components/data-display/MetricGrid';
import { Button } from '@/shared/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';
import RecentLoadsTable from '@/modules/dashboard/components/RecentLoadsTable';

function DashboardPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{
    loads: CargaQuimicaResponseDto[];
    products: number | null;
  } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const user = useCurrentUser();
  useEffect(() => {
    let active = true;
    Promise.all([
      cargaQuimicaApiRoutes.findAll(),
      produtoQuimicoApiRoutes.findAll().catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 403)
          return null;
        throw error;
      }),
    ])
      .then(([loads, products]) => {
        if (active)
          setData({
            loads: loads.data,
            products: products?.data.length ?? null,
          });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const loads = data?.loads ?? [];
  const activeLoads = loads.filter(
    (load) => !['FINALIZADA', 'CANCELADA'].includes(load.statusCarga),
  );
  const metrics: MetricItem[] = [
    {
      label: 'Cargas em operação',
      value: String(activeLoads.length),
      change: '',
      detail: 'Exclui finalizadas e canceladas',
      icon: Ship,
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Produtos cadastrados',
      value: data?.products == null ? '—' : String(data.products),
      change: '',
      detail:
        data?.products == null
          ? 'Sem permissão para consultar produtos'
          : 'Total no catálogo',
      icon: FlaskConical,
      tone: 'bg-chart-2/15 text-chart-2',
    },
    {
      label: 'Cargas finalizadas',
      value: String(
        loads.filter((load) => load.statusCarga === 'FINALIZADA').length,
      ),
      change: '',
      detail: 'Operações concluídas',
      icon: Boxes,
      tone: 'bg-chart-3/20 text-amber-700',
    },
    {
      label: 'Cargas bloqueadas',
      value: String(
        loads.filter((load) => load.statusCarga === 'BLOQUEADA').length,
      ),
      change: '',
      detail: 'Aguardando regularização',
      icon: CircleAlert,
      tone: 'bg-destructive/10 text-destructive',
    },
  ];
  const recentLoads = [...loads]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .map(toDashboardLoad);
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredLoads = recentLoads.filter((load) =>
    `${load.code} ${load.product} ${load.origin} ${load.status}`
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedSearch),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    return {
      label: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: loads.filter((load) => {
        const created = Date.parse(load.createdAt);
        return created >= date.getTime() && created < next.getTime();
      }).length,
    };
  });

  return (
    <>
      <Title
        eyebrow={new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}
        description="Aqui está o resumo das operações do seu terminal."
      >
        Olá, {user.name}
      </Title>
      {error ? (
        <div role="alert" className="space-y-3">
          <p>Não foi possível carregar os dados do painel.</p>
          <Button
            onClick={() => {
              setError(false);
              setData(null);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : !data ? (
        <p role="status">Carregando operações...</p>
      ) : (
        <>
          <MetricGrid items={metrics} label="Indicadores operacionais" />
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
            <ActivityChartCard
              title="Cargas cadastradas"
              description="Quantidade de cargas criadas por dia"
              periodLabel="Últimos 7 dias"
              data={days}
            />
            <Card>
              <CardHeader>
                <CardTitle>Cargas por status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <div
                    key={status}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span>{label}</span>
                    <strong>
                      {
                        loads.filter((load) => load.statusCarga === status)
                          .length
                      }
                    </strong>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
          <RecentLoadsTable
            loads={filteredLoads}
            totalLoads={recentLoads.length}
            search={search}
            onSearchChange={setSearch}
          />
        </>
      )}
    </>
  );
}
export default DashboardPage;
