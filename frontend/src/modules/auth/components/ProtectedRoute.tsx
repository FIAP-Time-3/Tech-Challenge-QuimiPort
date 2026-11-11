import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import {
  clearAccessToken,
  getAccessToken,
  validateAccessToken,
} from '@/modules/auth/services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAuthentication: boolean;
}

function ProtectedRoute({
  children,
  requiresAuthentication,
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const accessToken = getAccessToken();

    void validateAccessToken(accessToken ?? '').then((isValid) => {
      if (!isValid) {
        clearAccessToken();
      }

      if (isMounted) {
        setIsAuthenticated(isValid);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Verificando acesso...
      </main>
    );
  }

  if (requiresAuthentication !== isAuthenticated) {
    return <Navigate to={requiresAuthentication ? '/login' : '/'} replace />;
  }

  return children;
}

export default ProtectedRoute;
