import { Warehouse } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/Card';

interface CapacityCardProps {
  title: string;
  description: string;
  items: {
    label: string;
    value: number;
    color: string;
  }[];
  warning?: {
    title: string;
    description: string;
  };
}

function CapacityCard({
  title,
  description,
  items,
  warning,
}: CapacityCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardHeader className="px-5">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pt-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">{item.value}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label={`Ocupação: ${item.label}`}
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
        {warning && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex gap-2.5">
              <Warehouse
                className="mt-0.5 size-4 shrink-0 text-amber-700"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {warning.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                  {warning.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CapacityCard;
