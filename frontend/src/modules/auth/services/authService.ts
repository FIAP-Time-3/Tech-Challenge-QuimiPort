import { demoCredentials, demoSession } from '@/infrastructure/mocks/auth';
import type { AuthSession } from '@/modules/auth/models/auth';

export async function authenticate(
  email: string,
  password: string,
): Promise<AuthSession | null> {
  // Replace this mock with the API authentication request.
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (
    email.trim().toLocaleLowerCase('pt-BR') !== demoCredentials.email ||
    password !== demoCredentials.password
  ) {
    return null;
  }

  return demoSession;
}

export async function validateAccessToken(
  accessToken: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return accessToken === demoSession.accessToken;
}
