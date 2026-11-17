import { api } from '../api';
import type { UserResponseDto } from '../dtos/user.dtos';

export const meApiRoutes = {
  getMe: () => {
    return api.get<UserResponseDto>('me');
  },
};
