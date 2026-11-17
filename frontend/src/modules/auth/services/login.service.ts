import axios from 'axios';
import { loginApiRoutes } from '@/infrastructure/backend/routes/login.routes';
import { meApiRoutes } from '@/infrastructure/backend/routes/me.routes';
import { getStoredUser, saveUser } from '@/modules/auth/services/token.storage';
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
    const user = getStoredUser();
    if (!user) throw new Error('Não foi possível carregar o usuário');
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user,
    };
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
    if (!accessToken) return false;
    const { data } = await meApiRoutes.getMe();
    saveUser(data);
    return true;
  } catch {
    return false;
  }
}
