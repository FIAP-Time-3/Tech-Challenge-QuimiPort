import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface PageHeaderProps {
  onMenuOpen: () => void;
  menuOpen: boolean;
  breadcrumb: string;
  title: string;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  onLogout: () => void;
}

function PageHeader({
  breadcrumb,
  title,
  user,
  onLogout,
  onMenuOpen,
  menuOpen,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Abrir menu"
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={onMenuOpen}
        >
          <Menu aria-hidden="true" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>
          <p className="mt-0.5 truncate text-lg font-semibold tracking-tight">
            {title}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
