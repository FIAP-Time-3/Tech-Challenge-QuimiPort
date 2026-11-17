import type { ReactNode } from 'react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function Feedback({
  children,
  variant = 'error',
}: {
  children: ReactNode;
  variant?: 'error' | 'success';
}) {
  return (
    <Alert
      role={variant === 'error' ? 'alert' : 'status'}
      variant={variant === 'error' ? 'destructive' : 'default'}
      className={
        variant === 'success'
          ? 'border-primary/20 bg-secondary text-secondary-foreground'
          : 'border-destructive/20 bg-destructive/5'
      }
    >
      <AlertDescription className="text-current">{children}</AlertDescription>
    </Alert>
  );
}

export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="space-y-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground"
    >
      <p>{children}</p>
      <Skeleton aria-hidden="true" className="h-3 w-2/3" />
      <Skeleton aria-hidden="true" className="h-3 w-1/3" />
    </div>
  );
}
