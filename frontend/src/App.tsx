import { AppLayout } from '@/shared/components/layout/AppLayout';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import { BrowserRouter, useRoutes } from 'react-router';
import { authRoutes } from '@/modules/auth/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { produtoQuimicoRoutes } from '@/modules/produtoQuimico/routes';
import { healthRoutes } from '@/modules/health/routes';

function AppRoutes() {
  return useRoutes([
    ...authRoutes,
    ...healthRoutes,
    {
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [...dashboardRoutes, ...produtoQuimicoRoutes],
    },
  ]);
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
