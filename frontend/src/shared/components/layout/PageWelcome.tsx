import type { ReactNode } from 'react';

interface PageWelcomeProps {
  date: string;
  greeting: string;
  description: string;
  actions?: ReactNode;
}

function PageWelcome({
  date,
  greeting,
  description,
  actions,
}: PageWelcomeProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm text-muted-foreground">{date}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
          {greeting}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </section>
  );
}

export default PageWelcome;
