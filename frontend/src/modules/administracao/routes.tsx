import type { RouteObject } from 'react-router';
import { UserRole } from '@/infrastructure/backend/dtos/user.dtos';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import { administrationSections } from './sections';
import UserListPage from './pages/UserListPage';

const allowedRolesBySection: Record<UserRole, readonly UserRole[]> = {
  [UserRole.ADMINISTRADOR]: [UserRole.ADMINISTRADOR],
  [UserRole.OPERADOR]: [UserRole.ADMINISTRADOR],
  [UserRole.DESPACHANTE]: [UserRole.ADMINISTRADOR, UserRole.OPERADOR],
};

export const administrationRoutes: RouteObject[] = administrationSections.map(
  (section) => ({
    path: section.href,
    element: (
      <ProtectedRoute allowedRoles={allowedRolesBySection[section.role]}>
        <UserListPage key={section.role} section={section} />
      </ProtectedRoute>
    ),
  }),
);
