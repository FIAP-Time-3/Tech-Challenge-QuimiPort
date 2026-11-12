import axios, { type InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUser,
} from '@/modules/auth/services/tokenStorage';
import type { UserResponseDto } from './dtos/users';
import type { LoginResponseDto } from './dtos/login';

const options = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
};

export const api = axios.create(options);
// Login e refresh não passam pelo interceptor de renovação.
export const authApi = axios.create(options);

type RetryConfig = InternalAxiosRequestConfig & {
  retriedAfterRefresh?: boolean;
};
let refreshPromise: Promise<void> | null = null;
let redirecting = false;

function endSession(): void {
  clearTokens();
  if (!redirecting && window.location.pathname !== '/login') {
    redirecting = true;
    window.location.assign('/login');
  }
}

async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Refresh token não disponível');

  const { data } = await authApi.post<LoginResponseDto>('login/refresh', {
    refresh_token: refreshToken,
  });
  await establishSession(data, refreshToken);
}

export async function establishSession(
  tokens: LoginResponseDto,
  expectedRefreshToken?: string,
): Promise<UserResponseDto> {
  if (
    !tokens?.access_token ||
    !tokens.refresh_token ||
    typeof tokens.access_token !== 'string' ||
    typeof tokens.refresh_token !== 'string'
  ) {
    throw new Error('Resposta de autenticação inválida');
  }
  // Usa o novo access token sem passar pelo interceptor, evitando ciclos de refresh.
  const { data: user } = await authApi.get<UserResponseDto>('me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (
    !user ||
    !Number.isSafeInteger(user.id) ||
    typeof user.name !== 'string' ||
    typeof user.username !== 'string' ||
    !Array.isArray(user.roles) ||
    user.status !== true
  ) {
    throw new Error('Resposta de usuário inválida');
  }
  if (
    expectedRefreshToken !== undefined &&
    getRefreshToken() !== expectedRefreshToken
  ) {
    throw new Error('Sessão alterada');
  }
  saveTokens(tokens);
  saveUser(user);
  return user;
}

export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    redirecting = false;
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const config = error.config as RetryConfig | undefined;
    const expired = error.response.data?.code === 'ACCESS_TOKEN_EXPIRED';
    if (!config || !expired || config.retriedAfterRefresh) {
      endSession();
      return Promise.reject(error);
    }

    config.retriedAfterRefresh = true;
    try {
      // Respostas atrasadas do token antigo reutilizam a sessão já renovada.
      const currentToken = getAccessToken();
      if (
        !currentToken ||
        config.headers.Authorization === `Bearer ${currentToken}`
      ) {
        await refreshSession();
      }
    } catch (refreshError) {
      endSession();
      return Promise.reject(refreshError);
    }

    return api.request(config);
  },
);
