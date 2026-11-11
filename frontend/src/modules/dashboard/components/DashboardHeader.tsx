import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface DashboardHeaderProps {
  onLogout: () => void;
}

function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      <div>
        <p className="text-xs text-muted-foreground">QuimiPort / Operações</p>
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
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut aria-hidden="true" />
          Sair
        </Button>
      </div>
    </header>
  );
}

export default DashboardHeader;
