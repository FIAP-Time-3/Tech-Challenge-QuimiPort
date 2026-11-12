import { BrowserRouter, useRoutes } from 'react-router';
import { authRoutes } from '@/modules/auth/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { chemicalProductRoutes } from '@/modules/chemical-products/routes';
import { healthRoutes } from '@/modules/health/routes';

function AppRoutes() {
  return useRoutes([
    ...authRoutes,
    ...healthRoutes,
    ...dashboardRoutes,
    ...chemicalProductRoutes,
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
