import { ArrowRight, Search } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
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
  return (
    <Card id="loads" className="gap-0 py-0">
      <CardHeader className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Cargas recentes</CardTitle>
          <CardDescription className="mt-1">
            Acompanhe as últimas movimentações do terminal.
          </CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="bg-muted/40 text-xs text-muted-foreground">
                <th className="px-5 py-3.5 font-medium">Carga</th>
                <th className="px-4 py-3.5 font-medium">Produto</th>
                <th className="px-4 py-3.5 font-medium">Origem</th>
                <th className="px-4 py-3.5 font-medium">Quantidade</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Atualização</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loads.map((load) => (
                <tr key={load.code} className="hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium">{load.code}</td>
                  <td className="px-4 py-4">
                    <span className="block font-medium">{load.product}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {load.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {load.origin}
                  </td>
                  <td className="px-4 py-4 font-medium">{load.quantity}</td>
                  <td className="px-4 py-4">
                    <LoadStatus status={load.status} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {load.updated}
                  </td>
                </tr>
              ))}
              {loads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Nenhuma carga encontrada para “{search}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
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
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentLoadsTable;
