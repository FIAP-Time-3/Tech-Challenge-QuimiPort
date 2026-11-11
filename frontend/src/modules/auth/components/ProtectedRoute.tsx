import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { validateSession } from '@/modules/auth/use-cases/validateSession';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    void validateSession().then((isValid) => {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
