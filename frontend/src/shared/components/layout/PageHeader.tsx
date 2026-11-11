import { Bell, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  onLogout: () => void;
}

function PageHeader({ breadcrumb, title, user, onLogout }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      <div>
        <p className="text-xs text-muted-foreground">{breadcrumb}</p>
        <h1 className="mt-0.5 text-lg font-semibold tracking-tight">{title}</h1>
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
            {user.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
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

export default PageHeader;
