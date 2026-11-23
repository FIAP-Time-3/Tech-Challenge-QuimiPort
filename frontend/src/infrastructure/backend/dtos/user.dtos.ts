export const UserRole = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  OPERADOR: 'OPERADOR',
  DESPACHANTE: 'DESPACHANTE',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

const userRoles = Object.values(UserRole);

export interface CreateFirstAdminRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserRequestDto extends CreateFirstAdminRequestDto {
  status?: boolean;
}

export interface UpdateUserRequestDto {
  name: string;
  email: string;
  status: boolean;
}

export interface ListUserQueryDto {
  email?: string;
  page?: number;
  limit?: number;
  column?: string;
  order?: 'asc' | 'desc';
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: boolean;
}

export interface ListUserResponseDto {
  data: UserResponseDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RemoveUserResponseDto {
  id: number;
}

export interface UserPasswordResetDto {
  newPassword: string;
}

export interface UserPasswordChangeDto extends UserPasswordResetDto {
  currentPassword: string;
  newPasswordConfirm: string;
}

export function isUserResponse(user: unknown): user is UserResponseDto {
  if (!user || typeof user !== 'object') return false;

  const { id, name, email, role, status } = user as Partial<UserResponseDto>;
  return (
    Number.isSafeInteger(id) &&
    typeof name === 'string' &&
    typeof email === 'string' &&
    userRoles.some((allowedRole) => allowedRole === role) &&
    typeof status === 'boolean'
  );
}
