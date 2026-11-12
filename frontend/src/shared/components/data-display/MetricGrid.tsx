import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/Card';

export interface MetricItem {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
}

interface MetricGridProps {
  items: MetricItem[];
  label?: string;
}

function MetricGrid({ items, label = 'Indicadores' }: MetricGridProps) {
  return (
    <section
      aria-label={label}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="gap-0 py-5">
            <CardContent className="px-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight">
                    {metric.value}
                  </p>
                </div>
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${metric.tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-primary">
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.detail}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

export default MetricGrid;
