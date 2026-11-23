import { api, authApi } from '../api';
import type {
  CreateFirstAdminRequestDto,
  CreateUserRequestDto,
  ListUserQueryDto,
  ListUserResponseDto,
  RemoveUserResponseDto,
  UpdateUserRequestDto,
  UserPasswordResetDto,
  UserResponseDto,
  UserRole,
} from '../dtos/user.dtos';

const pathsByRole: Record<UserRole, string> = {
  ADMINISTRADOR: 'administradores',
  OPERADOR: 'operadores',
  DESPACHANTE: 'despachantes',
};

export const userApiRoutes = {
  createFirstAdmin: (data: CreateFirstAdminRequestDto) => {
    return authApi.post<UserResponseDto>('users/first_access', data);
  },
  create: (role: UserRole, data: CreateUserRequestDto) => {
    return api.post<UserResponseDto>(pathsByRole[role], data);
  },
  findAll: (role: UserRole, params?: ListUserQueryDto) => {
    return api.get<ListUserResponseDto>(pathsByRole[role], { params });
  },
  findOne: (role: UserRole, id: number) => {
    return api.get<UserResponseDto>(`${pathsByRole[role]}/${id}`);
  },
  update: (role: UserRole, id: number, data: UpdateUserRequestDto) => {
    return api.put<UserResponseDto>(`${pathsByRole[role]}/${id}`, data);
  },
  remove: (role: UserRole, id: number) => {
    return api.delete<RemoveUserResponseDto>(`${pathsByRole[role]}/${id}`);
  },
  resetPassword: (role: UserRole, id: number, data: UserPasswordResetDto) => {
    return api.patch<UserResponseDto>(
      `${pathsByRole[role]}/password/${id}`,
      data,
    );
  },
};
