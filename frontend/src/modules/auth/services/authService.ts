import axios from 'axios';
import { loginApiRoutes } from '@/infrastructure/backend/routes/login';
import { refreshSession } from '@/infrastructure/backend/api';
import type { AuthSession } from '@/modules/auth/models/auth';

export async function authenticate(
  username: string,
  password: string,
): Promise<AuthSession | null> {
  try {
    const { data } = await loginApiRoutes.login({
      username: username.trim(),
      password,
    });
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401)
      return null;
    throw error;
  }
}

export async function validateAccessToken(
  accessToken: string,
): Promise<boolean> {
  try {
    // A checagem local controla a navegação; a API valida assinatura e permissões.
    const payload = accessToken.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(normalized)) as {
      token_use?: string;
      exp?: number;
    };
    if (claims.token_use !== 'access' || typeof claims.exp !== 'number')
      return false;
    if (claims.exp * 1000 > Date.now()) return true;
    await refreshSession();
    return true;
  } catch {
    return false;
  }
}
