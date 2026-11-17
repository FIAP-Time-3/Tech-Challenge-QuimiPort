import type { RouteObject } from 'react-router';
import HealthPage from '@/modules/health/pages/HealthPage';

export const healthRoutes: RouteObject[] = [
  { path: '/health', element: <HealthPage /> },
];
