import type { LucideIcon } from 'lucide-react';

export interface SideNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  active?: boolean;
}

interface SideNavigationProps {
  brand: string;
  description?: string;
  brandHref?: string;
  brandIcon: LucideIcon;
  items: SideNavigationItem[];
  status?: {
    title: string;
    description: string;
  };
}

function SideNavigation({
  brand,
  description,
  brandHref = '/',
  brandIcon: BrandIcon,
  items,
  status,
}: SideNavigationProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <a
        href={brandHref}
        className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-6"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BrandIcon className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-semibold tracking-tight">
            {brand}
          </span>
          {description && (
            <span className="block text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </span>
      </a>

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-1 px-3 py-6"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menu principal
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
              {item.badge && (
                <span className="ml-auto rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {status && (
        <div className="m-3 rounded-xl border border-sidebar-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            {status.title}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {status.description}
          </p>
        </div>
      )}
    </aside>
  );
}

export default SideNavigation;
