import { authApi } from '../api';
import { saveTokens } from '@/modules/auth/services/tokenStorage';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
} from '../dtos/login';

const baseUrl = 'login';

export const loginApiRoutes = {
  login: (data: LoginRequestDto) => {
    return authApi.post<LoginResponseDto>(baseUrl, data).then((response) => {
      saveTokens(response.data);
      return response;
    });
  },
  refresh: (data: RefreshRequestDto) => {
    return authApi.post<LoginResponseDto>(`${baseUrl}/refresh`, data);
  },
};
