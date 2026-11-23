import { api } from '../api';
import type { UserPasswordChangeDto, UserResponseDto } from '../dtos/user.dtos';

export const meApiRoutes = {
  getMe: () => {
    return api.get<UserResponseDto>('me');
  },
  changePassword: (data: UserPasswordChangeDto) => {
    return api.patch<UserResponseDto>('me/password', data);
  },
};
