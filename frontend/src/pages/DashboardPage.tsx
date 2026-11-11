import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  CircleAlert,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Search,
  Ship,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { clearAccessToken } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const navigation = [
  { label: 'Visão geral', href: '#overview', icon: LayoutDashboard },
  { label: 'Cargas', href: '#loads', icon: Ship },
  { label: 'Produtos', href: '#products', icon: FlaskConical },
];

const metrics = [
  {
    label: 'Cargas em operação',
    value: '128',
    change: '+12,8%',
    detail: 'em relação ao mês passado',
    icon: Ship,
    tone: 'bg-primary/10 text-primary',
  },
  {
    label: 'Produtos cadastrados',
    value: '346',
    change: '+8 novos',
    detail: 'adicionados este mês',
    icon: FlaskConical,
    tone: 'bg-chart-2/15 text-chart-2',
  },
  {
    label: 'Volume movimentado',
    value: '2.840 t',
    change: '+6,2%',
    detail: 'em relação ao mês passado',
    icon: Boxes,
    tone: 'bg-chart-3/20 text-amber-700',
  },
  {
    label: 'Atenção necessária',
    value: '03',
    change: '2 vencendo',
    detail: 'documentos precisam de revisão',
    icon: CircleAlert,
    tone: 'bg-destructive/10 text-destructive',
  },
];

const loads = [
  {
    code: 'QP-2026-0481',
    product: 'Hidróxido de sódio',
    category: 'Corrosivo · Classe 8',
    origin: 'Porto de Santos',
    quantity: '24.500 kg',
    status: 'Em trânsito',
    updated: 'Hoje, 10:42',
  },
  {
    code: 'QP-2026-0479',
    product: 'Etanol industrial',
    category: 'Líquido inflamável · Classe 3',
    origin: 'Porto de Paranaguá',
    quantity: '18.200 L',
    status: 'Em análise',
    updated: 'Hoje, 09:18',
  },
  {
    code: 'QP-2026-0476',
    product: 'Ácido sulfúrico',
    category: 'Corrosivo · Classe 8',
    origin: 'Porto de Itajaí',
    quantity: '12.000 kg',
    status: 'Liberada',
    updated: 'Ontem, 16:35',
  },
  {
    code: 'QP-2026-0472',
    product: 'Amônia anidra',
    category: 'Gás tóxico · Classe 2',
    origin: 'Porto de Santos',
    quantity: '8.400 kg',
    status: 'Em trânsito',
    updated: 'Ontem, 14:06',
  },
];

const movements = [
  { day: 'Seg', value: 42 },
  { day: 'Ter', value: 68 },
  { day: 'Qua', value: 53 },
  { day: 'Qui', value: 84 },
  { day: 'Sex', value: 62 },
  { day: 'Sáb', value: 38 },
  { day: 'Dom', value: 73 },
];

function LoadStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Em trânsito': 'border-sky-200 bg-sky-50 text-sky-700',
    'Em análise': 'border-amber-200 bg-amber-50 text-amber-700',
    Liberada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </Badge>
  );
}

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const filteredLoads = loads.filter((load) =>
    `${load.code} ${load.product} ${load.origin} ${load.status}`
      .toLocaleLowerCase('pt-BR')
      .includes(search.toLocaleLowerCase('pt-BR')),
  );

  return (
    <div className="min-h-svh bg-muted/50">
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

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
          <div>
            <p className="text-xs text-muted-foreground">
              QuimiPort / Operações
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight">
              Visão geral
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificações"
            >
              <Bell aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-background bg-amber-500" />
            </Button>
            <span className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                MC
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Marina Costa</p>
                <p className="text-xs text-muted-foreground">Operações</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearAccessToken();
                navigate('/login', { replace: true });
              }}
            >
              <LogOut aria-hidden="true" />
              Sair
            </Button>
          </div>
        </header>

        <main
          id="overview"
          className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-8"
        >
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-muted-foreground">
                Quarta-feira, 11 de novembro de 2026
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
                Bom dia, Marina
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Aqui está o resumo das operações do seu terminal.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-background">
                <ArrowDownToLine aria-hidden="true" />
                <span className="hidden sm:inline">Exportar relatório</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
              <Button>
                <ClipboardList aria-hidden="true" />
                Nova carga
              </Button>
            </div>
          </section>

          <section
            aria-label="Indicadores operacionais"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {metrics.map((metric) => {
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
                      <span className="text-muted-foreground">
                        {metric.detail}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
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

            <Card id="products" className="gap-0 py-5">
              <CardHeader className="px-5">
                <CardTitle>Capacidade do terminal</CardTitle>
                <CardDescription className="mt-1">
                  Ocupação atual por área de armazenamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-5 pt-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Tanques</span>
                    <span className="text-muted-foreground">72%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Ocupação dos tanques"
                    aria-valuenow={72}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full w-[72%] rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Armazéns</span>
                    <span className="text-muted-foreground">48%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label="Ocupação dos armazéns"
                    aria-valuenow={48}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full w-[48%] rounded-full bg-chart-2" />
                  </div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                  <div className="flex gap-2.5">
                    <Warehouse
                      className="mt-0.5 size-4 shrink-0 text-amber-700"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Área B próxima do limite
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                        Ocupação em 89%. Revise a alocação das próximas cargas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card id="loads" className="gap-0 py-0">
            <CardHeader className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Cargas recentes</CardTitle>
                <CardDescription className="mt-1">
                  Acompanhe as últimas movimentações do terminal.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative sm:w-64">
                  <Search
                    className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    aria-label="Buscar cargas"
                    placeholder="Buscar carga ou produto..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-9 bg-background pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Ver todas as cargas"
                >
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-xs text-muted-foreground">
                      <th className="px-5 py-3.5 font-medium">Carga</th>
                      <th className="px-4 py-3.5 font-medium">Produto</th>
                      <th className="px-4 py-3.5 font-medium">Origem</th>
                      <th className="px-4 py-3.5 font-medium">Quantidade</th>
                      <th className="px-4 py-3.5 font-medium">Status</th>
                      <th className="px-5 py-3.5 font-medium">Atualização</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLoads.map((load) => (
                      <tr key={load.code} className="hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">{load.code}</td>
                        <td className="px-4 py-4">
                          <span className="block font-medium">
                            {load.product}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {load.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {load.origin}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {load.quantity}
                        </td>
                        <td className="px-4 py-4">
                          <LoadStatus status={load.status} />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {load.updated}
                        </td>
                      </tr>
                    ))}
                    {filteredLoads.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-muted-foreground"
                        >
                          Nenhuma carga encontrada para “{search}”.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
                <span>
                  Exibindo {filteredLoads.length} de {loads.length} cargas
                </span>
                <a
                  href="#loads"
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Ver todas
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </CardContent>
          </Card>

          <footer className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
            <span>QuimiPort · Gestão segura de operações químicas</span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Atualizado agora
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
