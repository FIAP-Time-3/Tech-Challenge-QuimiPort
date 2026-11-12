import type { UserResponseDto } from '@/infrastructure/backend/dtos/user.dtos';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}
