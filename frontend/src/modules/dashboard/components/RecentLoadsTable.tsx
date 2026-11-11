import { ArrowRight, Search } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import DataTable, {
  type DataTableColumn,
} from '@/shared/components/data-display/DataTable';
import { Input } from '@/shared/components/ui/input';
import type { DashboardLoad } from '@/modules/dashboard/models/dashboard';

interface RecentLoadsTableProps {
  loads: DashboardLoad[];
  totalLoads: number;
  search: string;
  onSearchChange: (value: string) => void;
}

const statusStyles: Record<DashboardLoad['status'], string> = {
  'Em trânsito': 'border-sky-200 bg-sky-50 text-sky-700',
  'Em análise': 'border-amber-200 bg-amber-50 text-amber-700',
  Liberada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

function LoadStatus({ status }: { status: DashboardLoad['status'] }) {
  return (
    <Badge variant="outline" className={statusStyles[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </Badge>
  );
}

function RecentLoadsTable({
  loads,
  totalLoads,
  search,
  onSearchChange,
}: RecentLoadsTableProps) {
  const columns: DataTableColumn<DashboardLoad>[] = [
    {
      key: 'code',
      header: 'Carga',
      render: (load) => load.code,
      className: 'font-medium',
    },
    {
      key: 'product',
      header: 'Produto',
      render: (load) => (
        <>
          <span className="block font-medium">{load.product}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {load.category}
          </span>
        </>
      ),
    },
    {
      key: 'origin',
      header: 'Origem',
      render: (load) => load.origin,
      className: 'text-muted-foreground',
    },
    {
      key: 'quantity',
      header: 'Quantidade',
      render: (load) => load.quantity,
      className: 'font-medium',
    },
    {
      key: 'status',
      header: 'Status',
      render: (load) => <LoadStatus status={load.status} />,
    },
    {
      key: 'updated',
      header: 'Atualização',
      render: (load) => load.updated,
      className: 'text-muted-foreground',
    },
  ];

  return (
    <div id="loads">
      <DataTable
        title="Cargas recentes"
        description="Acompanhe as últimas movimentações do terminal."
        rows={loads}
        columns={columns}
        getRowKey={(load) => load.code}
        minWidth="760px"
        emptyMessage={`Nenhuma carga encontrada para “${search}”.`}
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                aria-label="Buscar cargas"
                placeholder="Buscar carga ou produto..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-9 bg-background pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Ver todas as cargas"
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        }
        footer={
          <>
            <span>
              Exibindo {loads.length} de {totalLoads} cargas
            </span>
            <a
              href="#loads"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Ver todas
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </>
        }
      />
    </div>
  );
}

export default RecentLoadsTable;
