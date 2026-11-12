import { api } from '../api';
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshRequestDto,
} from '../dtos/login';

const baseUrl = 'login';

export const loginApiRoutes = {
  login: (data: LoginRequestDto) => {
    return api.post<LoginResponseDto>(baseUrl, data);
  },
  refresh: (data: RefreshRequestDto) => {
    return api.post<LoginResponseDto>(`${baseUrl}/refresh`, data);
  },
};
