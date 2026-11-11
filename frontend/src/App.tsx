import { BrowserRouter, useRoutes } from 'react-router';
import { authRoutes } from '@/modules/auth/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { chemicalProductRoutes } from '@/modules/chemical-products/routes';

function AppRoutes() {
  return useRoutes([
    ...authRoutes,
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
