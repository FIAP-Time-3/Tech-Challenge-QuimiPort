import { Feedback, LoadingState } from '@/shared/components/feedback/Feedback';
import axios from 'axios';
import { loginApiRoutes } from '@/infrastructure/backend/routes/login.routes';
import { userApiRoutes } from '@/infrastructure/backend/routes/user.routes';
import {
  ArrowRight,
  Eye,
  EyeOff,
  FlaskConical,
  LockKeyhole,
} from 'lucide-react';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { login } from '@/modules/auth/use-cases/login';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

function LoginPage() {
  const navigate = useNavigate();
  const [setup, setSetup] = useState<
    'loading' | 'required' | 'ready' | 'error'
  >('loading');
  const [setupAttempt, setSetupAttempt] = useState(0);
  const [name, setName] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    loginApiRoutes
      .getSetup(controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted)
          setSetup(data.requiresSetup ? 'required' : 'ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setSetup('error');
      });
    return () => controller.abort();
  }, [setupAttempt]);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (isSubmitting || (setup !== 'required' && setup !== 'ready')) return;
    setErrorMessage('');
    setSuccessMessage('');
    if (setup === 'required' && password !== confirmation) {
      setErrorMessage('As senhas não conferem.');
      return;
    }
    if (!username.trim() || (setup === 'required' && !name.trim())) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }
    setIsSubmitting(true);

    try {
      if (setup === 'required') {
        await userApiRoutes.createFirstAdmin({
          name: name.trim(),
          username: username.trim(),
          password,
        });
        setUsername(username.trim());
        setPassword('');
        setConfirmation('');
        setSetup('ready');
        setSuccessMessage('Administrador criado. Entre para continuar.');
        return;
      }
      const session = await login(username, password);
      if (!session) {
        setErrorMessage(
          'Usuário ou senha inválidos. Confira os dados e tente novamente.',
        );
        return;
      }
      navigate('/', { replace: true });
    } catch (error) {
      if (setup === 'required' && axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setSetup('ready');
          setPassword('');
          setConfirmation('');
          setErrorMessage(
            'A configuração inicial já foi concluída. Entre com suas credenciais.',
          );
          return;
        }
        if (error.response?.status === 409) {
          setErrorMessage(
            'Esse usuário já está em uso. Escolha outro nome de usuário.',
          );
          return;
        }
        if (error.response?.status === 400) {
          setErrorMessage('Confira os dados informados e tente novamente.');
          return;
        }
      }
      setErrorMessage(
        'Não foi possível acessar o sistema. Tente novamente em instantes.',
      );
    } finally {
      setIsSubmitting(false);
    }
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
              {setup === 'required'
                ? 'Crie o primeiro administrador'
                : 'Acesse sua conta'}
            </CardTitle>
            <CardDescription>
              {setup === 'required'
                ? 'Configure o acesso inicial ao QuimiPort.'
                : 'Entre com suas credenciais para continuar no QuimiPort.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pt-6 pb-7 sm:px-8 sm:pb-8">
            {setup === 'loading' ? (
              <LoadingState>Verificando configuração inicial...</LoadingState>
            ) : setup === 'error' ? (
              <div className="space-y-4">
                <Feedback>
                  Não foi possível verificar a configuração do sistema.
                </Feedback>
                <Button
                  onClick={() => {
                    setSetup('loading');
                    setSetupAttempt((attempt) => attempt + 1);
                  }}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {setup === 'required' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    className="h-10 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha
                    </Label>
                    {setup === 'ready' && (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs font-medium"
                        onClick={() =>
                          setErrorMessage(
                            'Entre em contato com o administrador para recuperar seu acesso.',
                          )
                        }
                      >
                        Esqueceu a senha?
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        setup === 'required'
                          ? 'new-password'
                          : 'current-password'
                      }
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      className="h-10 bg-background pr-11"
                    />
                    <Button
                      type="button"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((visible) => !visible)}
                      variant="ghost"
                      className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>

                {setup === 'required' && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmation"
                      className="text-sm font-medium"
                    >
                      Confirmar senha
                    </Label>
                    <Input
                      id="confirmation"
                      name="confirmation"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      required
                    />
                  </div>
                )}
                {successMessage && (
                  <Feedback variant="success">{successMessage}</Feedback>
                )}
                {errorMessage && <Feedback>{errorMessage}</Feedback>}

                <Button
                  type="submit"
                  className="h-10 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Aguarde...'
                    : setup === 'required'
                      ? 'Criar administrador'
                      : 'Entrar'}
                  {!isSubmitting && <ArrowRight aria-hidden="true" />}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default LoginPage;
