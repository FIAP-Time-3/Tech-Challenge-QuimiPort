import { ArrowDownToLine, ClipboardList } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

function DashboardWelcome() {
  return (
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
  );
}

export default DashboardWelcome;
