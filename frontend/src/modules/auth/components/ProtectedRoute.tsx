import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Navigate, useLocation } from 'react-router';
import AccessDeniedPage from '@/infrastructure/defaultPages/AccessDeniedPage';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import type { UserRole } from '@/infrastructure/backend/dtos/user.dtos';
import { useCurrentUser } from '@/modules/auth/hooks/useCurrentUser';
import { validateSession } from '@/modules/auth/use-cases/validateSession';

const ValidatedSessionContext = createContext(false);

interface ProtectedRouteProps {
  allowedRoles?: readonly UserRole[];
  children: ReactNode;
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const hasValidatedSession = useContext(ValidatedSessionContext);
  const { role } = useCurrentUser();
  const { pathname, hash } = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasValidatedSession) return;

    let isMounted = true;

    void validateSession().then((isValid) => {
      if (isMounted) {
        setIsAuthenticated(isValid);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [hasValidatedSession]);

  const sessionStatus = hasValidatedSession ? true : isAuthenticated;

  if (sessionStatus === null) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Verificando acesso...
      </main>
    );
  }

  if (!sessionStatus || !role) {
    const isHome = pathname === '/' && !hash;
    return (
      <Navigate
        to="/login"
        replace
        state={isHome ? null : { accessDenied: true }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return hasValidatedSession ? (
      <AccessDeniedPage />
    ) : (
      <AppLayout>
        <AccessDeniedPage />
      </AppLayout>
    );
  }

  return (
    <ValidatedSessionContext.Provider value={true}>
      {children}
    </ValidatedSessionContext.Provider>
  );
}

export default ProtectedRoute;
