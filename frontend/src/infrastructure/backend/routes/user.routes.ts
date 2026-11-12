import { api } from '../api';
import type {
  CreateFirstAdminRequestDto,
  CreateOrUpdateUserRequestDto,
  RemoveUserResponseDto,
  UserResponseDto,
} from '../dtos/user.dtos';

const baseUrl = 'users';

export const userApiRoutes = {
  createFirstAdmin: (data: CreateFirstAdminRequestDto) => {
    return api.post<UserResponseDto>(`${baseUrl}/first_access`, data);
  },
  create: (data: CreateOrUpdateUserRequestDto) => {
    return api.post<UserResponseDto>(baseUrl, data);
  },
  findAll: () => {
    return api.get<UserResponseDto[]>(baseUrl);
  },
  findOne: (id: number) => {
    return api.get<UserResponseDto>(`${baseUrl}/${id}`);
  },
  update: (id: number, data: CreateOrUpdateUserRequestDto) => {
    return api.put<UserResponseDto>(`${baseUrl}/${id}`, data);
  },
  remove: (id: number) => {
    return api.delete<RemoveUserResponseDto>(`${baseUrl}/${id}`);
  },
};
