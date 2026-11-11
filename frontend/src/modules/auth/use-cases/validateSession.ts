import { validateAccessToken } from '@/modules/auth/services/authService';
import {
  clearAccessToken,
  getAccessToken,
} from '@/modules/auth/services/tokenStorage';

export async function validateSession(): Promise<boolean> {
  const accessToken = getAccessToken();
  const isValid = accessToken ? await validateAccessToken(accessToken) : false;

  if (!isValid) {
    clearAccessToken();
  }

  return isValid;
}
