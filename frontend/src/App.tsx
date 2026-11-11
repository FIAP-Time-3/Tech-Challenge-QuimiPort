import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import {
  clearAccessToken,
  getAccessToken,
  validateAccessToken,
} from '@/modules/auth/services/auth';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import LoginPage from '@/modules/auth/pages/LoginPage';

function AuthGate({
  children,
  requiresAuthentication,
}: {
  children: ReactNode;
  requiresAuthentication: boolean;
}) {
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AuthGate key="dashboard" requiresAuthentication>
              <DashboardPage />
            </AuthGate>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGate key="login" requiresAuthentication={false}>
              <LoginPage />
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
