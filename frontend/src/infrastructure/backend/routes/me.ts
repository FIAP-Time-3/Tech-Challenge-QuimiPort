import { api } from '../api';
import type { UserResponseDto } from '../dtos/users';

export const meApiRoutes = {
  getMe: () => {
    return api.get<UserResponseDto>('me');
  },
};
