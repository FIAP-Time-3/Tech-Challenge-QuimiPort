import { BrowserRouter, useRoutes } from 'react-router';
import { authRoutes } from '@/modules/auth/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';

function AppRoutes() {
  return useRoutes([...authRoutes, ...dashboardRoutes]);
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
