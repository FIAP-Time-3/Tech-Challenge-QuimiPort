import { authenticate } from '@/modules/auth/services/authService';
import type { AuthSession } from '@/modules/auth/models/auth';
import { saveAccessToken } from '@/modules/auth/services/tokenStorage';

export async function login(
  email: string,
  password: string,
): Promise<AuthSession | null> {
  const session = await authenticate(email, password);

  if (session) {
    saveAccessToken(session.accessToken);
  }

  return session;
}
