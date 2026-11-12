import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';

interface ActivityChartCardProps {
  title: string;
  description: string;
  periodLabel: string;
  data: { label: string; value: number }[];
  highlightIndex?: number;
  trend?: {
    value: string;
    description: string;
  };
}

function ActivityChartCard({
  title,
  description,
  periodLabel,
  data,
  highlightIndex = -1,
  trend,
}: ActivityChartCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardHeader className="flex flex-row items-start justify-between px-5">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
        <Badge variant="secondary" className="font-medium">
          {periodLabel}
        </Badge>
      </CardHeader>
      <CardContent className="px-5 pt-6">
        <div className="flex h-40 items-end justify-between gap-2 sm:gap-4">
          {data.map((item, index) => (
            <div
              key={item.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className={`w-full max-w-10 rounded-t-md transition-colors ${
                  index === highlightIndex ? 'bg-primary' : 'bg-primary/15'
                }`}
                style={{
                  height: `${(item.value / Math.max(1, ...data.map((entry) => entry.value))) * 100}%`,
                }}
                role="img"
                aria-label={`${item.label}: ${item.value}`}
              />
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {trend && (
          <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm">
            <span className="flex items-center gap-1 font-medium text-primary">
              <ArrowUpRight className="size-4" aria-hidden="true" />
              {trend.value}
            </span>
            <span className="text-muted-foreground">{trend.description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ActivityChartCard;
