import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Feedback } from '@/shared/components/feedback/Feedback';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import PasswordField from '../components/PasswordField';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { login } from '@/modules/auth/use-cases/login';

export default function LoginPage() {
  const navigate = useNavigate();
  const { pathname, search, hash, state } = useLocation();
  const [accessDenied] = useState(() => state?.accessDenied === true);
  const [setupResult] = useState<'created' | 'alreadyConfigured' | undefined>(
    () => state?.setupResult,
  );
  const [email, setEmail] = useState<string>(() =>
    typeof state?.email === 'string' ? state.email : '',
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (state?.accessDenied === true || state?.setupResult) {
      void navigate({ pathname, search, hash }, { replace: true, state: null });
    }
  }, [hash, navigate, pathname, search, state]);

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }
    setIsSubmitting(true);

    try {
      const session = await login(email, password);
      if (!session) {
        setErrorMessage(
          'E-mail ou senha inválidos. Confira os dados e tente novamente.',
        );
        return;
      }
      void navigate('/', { replace: true });
    } catch {
      setErrorMessage(
        'Não foi possível acessar o sistema. Tente novamente em instantes.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Acesse sua conta"
      description="Entre com suas credenciais para continuar no QuimiPort."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {accessDenied && (
          <Feedback>
            Acesso Negado. Entre na sua conta para acessar esta página.
          </Feedback>
        )}
        {setupResult === 'created' && (
          <Feedback variant="success">
            Administrador criado. Entre para continuar.
          </Feedback>
        )}
        {setupResult === 'alreadyConfigured' && (
          <Feedback>
            A configuração inicial já foi concluída. Entre com suas credenciais.
          </Feedback>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-10 bg-background"
          />
        </div>

        <PasswordField
          password={password}
          showPassword={showPassword}
          autoComplete="current-password"
          onChange={setPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
        />
        {errorMessage && <Feedback>{errorMessage}</Feedback>}
        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Aguarde...' : 'Entrar'}
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
