import { clearAccessToken } from '@/modules/auth/services/tokenStorage';

export function logout(): void {
  clearAccessToken();
}
