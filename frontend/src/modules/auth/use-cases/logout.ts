import { clearTokens } from '@/modules/auth/services/tokenStorage';

export function logout(): void {
  clearTokens();
}
