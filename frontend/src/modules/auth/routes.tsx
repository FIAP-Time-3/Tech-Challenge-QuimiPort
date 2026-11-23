import type { RouteObject } from 'react-router';
import AuthSetupRoute from './components/AuthSetupRoute';
import FirstAccessPage from './pages/FirstAccessPage';
import LoginPage from './pages/LoginPage';

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AuthSetupRoute key="login">
        <LoginPage />
      </AuthSetupRoute>
    ),
  },
  {
    path: '/first-access',
    element: (
      <AuthSetupRoute key="first-access" firstAccess>
        <FirstAccessPage />
      </AuthSetupRoute>
    ),
  },
];
