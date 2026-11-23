import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { loginApiRoutes } from '@/infrastructure/backend/routes/login.routes';
import { Feedback, LoadingState } from '@/shared/components/feedback/Feedback';
import { Button } from '@/shared/components/ui/button';
import AuthLayout from './AuthLayout';

export default function AuthSetupRoute({
  firstAccess = false,
  children,
}: {
  firstAccess?: boolean;
  children: ReactNode;
}) {
  const [setup, setSetup] = useState<
    'loading' | 'required' | 'ready' | 'error'
  >('loading');
  const [setupAttempt, setSetupAttempt] = useState(0);

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

  if (setup === 'required' && !firstAccess)
    return <Navigate to="/first-access" replace />;
  if (setup === 'ready' && firstAccess) return <Navigate to="/login" replace />;
  if (setup === 'required' || setup === 'ready') return children;

  return (
    <AuthLayout
      title={firstAccess ? 'Crie o primeiro administrador' : 'Acesse sua conta'}
    >
      {setup === 'loading' ? (
        <LoadingState>Verificando configuração inicial...</LoadingState>
      ) : (
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
      )}
    </AuthLayout>
  );
}
