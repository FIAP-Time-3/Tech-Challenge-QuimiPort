import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SideNavigation({
  brand,
  description,
  brandHref = '/',
  brandIcon: BrandIcon,
  items,
  mobileOpen = false,
  onMobileClose,
}: SideNavigationProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (mobileOpen && !dialog.current?.open) dialog.current?.showModal();
    else if (!mobileOpen && dialog.current?.open) dialog.current.close();
  }, [mobileOpen]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (query.matches) onMobileClose?.();
    };
    query.addEventListener('change', closeOnDesktop);
    return () => query.removeEventListener('change', closeOnDesktop);
  }, [onMobileClose]);

  const content = (
    <>
      <Link
        to={brandHref}
        onClick={onMobileClose}
        className="flex h-[76px] shrink-0 items-center gap-3 border-b border-sidebar-border px-6"
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
      </Link>
      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-6"
      >
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Menu principal
        </p>
        {items.map(({ icon: Icon, ...item }) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onMobileClose}
            aria-current={item.active ? 'page' : undefined}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
            {item.badge && (
              <span className="ml-auto rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {content}
      </aside>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        aria-label="Menu de navegação"
        onCancel={(event) => {
          event.preventDefault();
          onMobileClose?.();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) onMobileClose?.();
        }}
        className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] border-0 border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground backdrop:bg-black/50"
      >
        <div className="flex h-full flex-col">
          <div className="flex justify-end px-3 pt-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar menu"
              onClick={onMobileClose}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          {content}
        </div>
      </dialog>
    </>
  );
}
export default SideNavigation;
