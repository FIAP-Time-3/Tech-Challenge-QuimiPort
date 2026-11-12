import { authenticate } from '@/modules/auth/services/login.service';
import type { AuthSession } from '@/modules/auth/models/auth';

export async function login(
  username: string,
  password: string,
): Promise<AuthSession | null> {
  return authenticate(username, password);
}
