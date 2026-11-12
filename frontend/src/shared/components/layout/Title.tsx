import type { ReactNode } from 'react';

interface TitleProps {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function Title({ children, description, eyebrow, actions }: TitleProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          {children}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </section>
  );
}
