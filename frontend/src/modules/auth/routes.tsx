import type { RouteObject } from 'react-router';
import LoginPage from '@/modules/auth/pages/LoginPage';

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
];
