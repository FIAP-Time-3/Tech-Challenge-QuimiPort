import type { UserResponseDto } from '@/infrastructure/backend/dtos/users';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
