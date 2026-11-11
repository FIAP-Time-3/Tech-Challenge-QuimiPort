import { ArrowUpRight, Warehouse } from 'lucide-react';
import {
  capacityWarning,
  movements,
  terminalCapacity,
} from '@/infrastructure/mocks/dashboard';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

function MovementChart() {
  return (
    <Card id="reports" className="gap-0 py-5">
      <CardHeader className="flex flex-row items-start justify-between px-5">
        <div>
          <CardTitle>Movimentação de cargas</CardTitle>
          <CardDescription className="mt-1">
            Volume de operações nos últimos 7 dias
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-medium">
          Esta semana
        </Badge>
      </CardHeader>
      <CardContent className="px-5 pt-6">
        <div className="flex h-40 items-end justify-between gap-2 sm:gap-4">
          {movements.map((movement, index) => (
            <div
              key={movement.day}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className={`w-full max-w-10 rounded-t-md transition-colors ${
                  index === 3 ? 'bg-primary' : 'bg-primary/15'
                }`}
                style={{ height: `${movement.value}%` }}
                role="img"
                aria-label={`${movement.day}: ${movement.value} operações`}
              />
              <span className="text-xs text-muted-foreground">
                {movement.day}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm">
          <span className="flex items-center gap-1 font-medium text-primary">
            <ArrowUpRight className="size-4" aria-hidden="true" />
            12,5%
          </span>
          <span className="text-muted-foreground">
            em comparação à semana anterior
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function OccupancyBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={`Ocupação: ${label}`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function TerminalCapacity() {
  return (
    <Card id="products" className="gap-0 py-5">
      <CardHeader className="px-5">
        <CardTitle>Capacidade do terminal</CardTitle>
        <CardDescription className="mt-1">
          Ocupação atual por área de armazenamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pt-4">
        {terminalCapacity.map((item) => (
          <OccupancyBar
            key={item.label}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
          <div className="flex gap-2.5">
            <Warehouse
              className="mt-0.5 size-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {capacityWarning.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                {capacityWarning.description}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationsCharts() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
      <MovementChart />
      <TerminalCapacity />
    </section>
  );
}

export default OperationsCharts;
