import type { ReactNode } from 'react';
import { FlaskConical, LockKeyhole } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export default function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-36 size-[500px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-16 size-[340px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent"
        />

        <a href="/" className="relative z-10 flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-tight">
              QuimiPort
            </span>
            <span className="block text-xs text-primary-foreground/70">
              gestão portuária
            </span>
          </span>
        </a>

        <div className="relative z-10 max-w-xl py-14">
          <Badge className="mb-6 border border-white/20 bg-white/10 text-primary-foreground hover:bg-white/10">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            LOGÍSTICA QUÍMICA INTELIGENTE
          </Badge>
          <h1 className="text-4xl leading-[1.12] font-semibold tracking-tight xl:text-5xl">
            Operações mais seguras, do porto ao destino.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-primary-foreground/75">
            Centralize cargas, produtos e conformidade em uma plataforma feita
            para a rotina portuária.
          </p>
        </div>

        <p className="relative z-10 text-xs text-primary-foreground/60">
          © 2026 QuimiPort · Gestão segura de operações químicas
        </p>
      </section>

      <section className="flex min-h-svh flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="mb-8 flex w-full max-w-md items-center gap-3 lg:hidden">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-semibold tracking-tight">
              QuimiPort
            </span>
            <span className="block text-xs text-muted-foreground">
              gestão portuária
            </span>
          </span>
        </div>

        <Card className="w-full max-w-md gap-0 border-border/80 py-0 shadow-[0_24px_70px_-38px_oklch(0.35_0.06_165/0.28)]">
          <CardHeader className="gap-2 px-6 pt-7 sm:px-8 sm:pt-8">
            <Badge variant="secondary" className="mb-1 w-fit">
              <LockKeyhole aria-hidden="true" />
              Acesso seguro
            </Badge>
            <CardTitle className="text-2xl tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent className="px-6 pt-6 pb-7 sm:px-8 sm:pb-8">
            {children}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
