import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Feedback } from '@/shared/components/feedback/Feedback';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import PasswordField from '../components/PasswordField';
import axios from 'axios';
import { userApiRoutes } from '@/infrastructure/backend/routes/user.routes';

export default function FirstAccessPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    if (password !== confirmation) {
      setErrorMessage('As senhas não conferem.');
      return;
    }
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }
    setIsSubmitting(true);

    try {
      await userApiRoutes.createFirstAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      void navigate('/login', {
        replace: true,
        state: { setupResult: 'created', email: email.trim() },
      });
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      if (status === 403) {
        void navigate('/login', {
          replace: true,
          state: { setupResult: 'alreadyConfigured' },
        });
      } else if (status === 409) {
        setErrorMessage('Esse e-mail já está em uso. Informe outro e-mail.');
      } else if (status === 400) {
        setErrorMessage('Confira os dados informados e tente novamente.');
      } else {
        setErrorMessage(
          'Não foi possível criar o administrador. Tente novamente em instantes.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Crie o primeiro administrador"
      description="Configure o acesso inicial ao QuimiPort."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
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
          autoComplete="new-password"
          onChange={setPassword}
          onToggle={() => setShowPassword((visible) => !visible)}
        />
        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmar senha</Label>
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
        {errorMessage && <Feedback>{errorMessage}</Feedback>}
        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Aguarde...' : 'Criar administrador'}
          {!isSubmitting && <ArrowRight aria-hidden="true" />}
        </Button>
      </form>
    </AuthLayout>
  );
}
