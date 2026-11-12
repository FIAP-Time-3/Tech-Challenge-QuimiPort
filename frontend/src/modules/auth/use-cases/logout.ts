import { clearTokens } from '@/modules/auth/services/token.storage';

export function logout(): void {
  clearTokens();
}
