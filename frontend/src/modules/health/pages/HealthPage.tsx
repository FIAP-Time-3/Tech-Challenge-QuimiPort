import { Activity, FlaskConical, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Health } from '@/modules/health/models/health';
import { HealthStatus } from '@/modules/health/components/HealthStatus';
import { getHealth } from '@/modules/health/use-cases/getHealth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type HealthState =
  { kind: 'loading' } | { kind: 'error' } | { kind: 'loaded'; data: Health };

function HealthPage() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const request = getHealth();
    let active = true;
    async function loadHealth() {
      try {
        const data = await request.promise;
        if (active) setState({ kind: 'loaded', data });
      } catch {
        if (active) setState({ kind: 'error' });
      }
    }

    void loadHealth();
    return () => {
      active = false;
      request.cancel();
    };
  }, [attempt]);

  const data = state.kind === 'loaded' ? state.data : null;

  function refresh() {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }

  return (
    <main className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/login"
            className="flex items-center gap-3 font-semibold tracking-tight"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FlaskConical className="size-5" aria-hidden="true" />
            </span>
            QuimiPort
          </Link>
          <Button asChild variant="outline">
            <Link to="/login">Acessar plataforma</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Badge variant="secondary" className="mb-4">
              <Activity aria-hidden="true" /> Status do sistema
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Saúde da plataforma
            </h1>
            <p className="mt-3 text-muted-foreground">
              Acompanhe a disponibilidade dos serviços do QuimiPort.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refresh}
            disabled={state.kind === 'loading'}
          >
            <RefreshCw aria-hidden="true" /> Atualizar
          </Button>
        </div>

        <div aria-live="polite">
          {state.kind === 'loading' && (
            <Card>
              <CardContent className="py-6 text-muted-foreground">
                Consultando os serviços...
              </CardContent>
            </Card>
          )}
          {state.kind === 'error' && (
            <Card className="border border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Não foi possível consultar a API
                </CardTitle>
                <CardDescription>
                  Verifique a conexão e tente atualizar novamente.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {data && <HealthStatus data={data} />}
        </div>
      </div>
    </main>
  );
}

export default HealthPage;
