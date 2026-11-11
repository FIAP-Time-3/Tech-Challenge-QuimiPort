import type { RouteObject } from 'react-router';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
];
