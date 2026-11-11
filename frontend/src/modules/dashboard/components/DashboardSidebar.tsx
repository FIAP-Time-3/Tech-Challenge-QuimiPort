import { FlaskConical, LayoutDashboard, Ship } from 'lucide-react';

const navigation = [
  { label: 'Visão geral', href: '#overview', icon: LayoutDashboard },
  { label: 'Cargas', href: '#loads', icon: Ship },
  { label: 'Produtos', href: '#products', icon: FlaskConical },
];

function DashboardSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <a
        href="#overview"
        className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-6"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <FlaskConical className="size-5" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-lg font-semibold tracking-tight">
            QuimiPort
          </span>
          <span className="block text-xs text-muted-foreground">
            gestão portuária
          </span>
        </span>
      </a>

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-1 px-3 py-6"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menu principal
        </p>
        {navigation.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              aria-current={index === 0 ? 'page' : undefined}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                index === 0
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
              {item.label === 'Cargas' && (
                <span className="ml-auto rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  12
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full bg-emerald-500" />
          Sistema operacional
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Dados sincronizados há poucos minutos.
        </p>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
