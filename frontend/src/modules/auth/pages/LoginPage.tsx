import {
  ArrowRight,
  Eye,
  EyeOff,
  FlaskConical,
  LockKeyhole,
  ShieldCheck,
  Ship,
} from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { authenticate, saveAccessToken } from '@/modules/auth/services/auth';
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

const demoCredentials = {
  email: 'marina@quimiport.com.br',
  password: 'quimiport2026',
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const session = await authenticate(email, password);
    setIsSubmitting(false);

    if (!session) {
      setErrorMessage(
        'E-mail ou senha inválidos. Confira os dados e tente novamente.',
      );
      return;
    }

    saveAccessToken(session.accessToken);
    navigate('/', { replace: true });
  }

  function fillDemoCredentials() {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setErrorMessage('');
  }

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

          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Ship
                className="mb-5 size-5 text-emerald-200"
                aria-hidden="true"
              />
              <p className="text-2xl font-semibold">128</p>
              <p className="mt-1 text-xs text-primary-foreground/70">
                cargas em operação
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <ShieldCheck
                className="mb-5 size-5 text-emerald-200"
                aria-hidden="true"
              />
              <p className="text-2xl font-semibold">100%</p>
              <p className="mt-1 text-xs text-primary-foreground/70">
                foco em conformidade
              </p>
            </div>
          </div>
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
            <CardTitle className="text-2xl tracking-tight">
              Acesse sua conta
            </CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar no QuimiPort.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pt-6 pb-7 sm:px-8 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="voce@empresa.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-10 bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() =>
                      setErrorMessage(
                        'Para esta demonstração, use as credenciais de acesso demo.',
                      )
                    }
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-10 bg-background pr-11"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                />
                Manter conectado
              </label>

              {errorMessage && (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                >
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando acesso...' : 'Entrar'}
                {!isSubmitting && <ArrowRight aria-hidden="true" />}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">
                    acesso de demonstração
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs leading-relaxed">
                    <p className="font-medium text-foreground">
                      Conta de operador
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      marina@quimiport.com.br
                    </p>
                    <p className="text-muted-foreground">
                      Senha: quimiport2026
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 bg-background"
                    onClick={fillDemoCredentials}
                  >
                    Preencher
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 max-w-md text-center text-xs leading-relaxed text-muted-foreground">
          Demonstração de interface. Este login não autentica usuários reais nem
          deve ser usado em produção.
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
