import { Boxes, CircleAlert, FlaskConical, Ship } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { metrics } from '@/infrastructure/mocks/dashboard';

const metricPresentation = {
  loads: { icon: Ship, tone: 'bg-primary/10 text-primary' },
  products: { icon: FlaskConical, tone: 'bg-chart-2/15 text-chart-2' },
  volume: { icon: Boxes, tone: 'bg-chart-3/20 text-amber-700' },
  attention: { icon: CircleAlert, tone: 'bg-destructive/10 text-destructive' },
};

function MetricsGrid() {
  return (
    <section
      aria-label="Indicadores operacionais"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map((metric) => {
        const presentation = metricPresentation[metric.type];
        const Icon = presentation.icon;
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
                  className={`flex size-10 items-center justify-center rounded-xl ${presentation.tone}`}
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

export default MetricsGrid;
