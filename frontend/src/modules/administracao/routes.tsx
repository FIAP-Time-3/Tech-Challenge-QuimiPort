import type { RouteObject } from 'react-router';
import { administrationSections } from './sections';
import UserListPage from './pages/UserListPage';

export const administrationRoutes: RouteObject[] = administrationSections.map(
  (section) => ({
    path: section.href,
    element: <UserListPage key={section.role} section={section} />,
  }),
);
