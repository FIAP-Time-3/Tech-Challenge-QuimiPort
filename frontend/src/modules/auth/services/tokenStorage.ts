import type { UserResponseDto } from '@/infrastructure/backend/dtos/user.dtos';
const accessTokenStorageKey = 'quimiport.access-token';

export function getAccessToken(): string | null {
  return localStorage.getItem(accessTokenStorageKey);
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(accessTokenStorageKey, accessToken);
}

export function clearAccessToken(): void {
  localStorage.removeItem(accessTokenStorageKey);
}

const refreshTokenStorageKey = 'quimiport.refresh-token';

export function getRefreshToken(): string | null {
  return localStorage.getItem(refreshTokenStorageKey);
}

export function saveTokens(tokens: {
  access_token: string;
  refresh_token: string;
}): void {
  localStorage.setItem(refreshTokenStorageKey, tokens.refresh_token);
  saveAccessToken(tokens.access_token);
}

export function clearTokens(): void {
  clearAccessToken();
  localStorage.removeItem(refreshTokenStorageKey);
  localStorage.removeItem(userStorageKey);
  window.dispatchEvent(new Event('quimiport.session-changed'));
}

const userStorageKey = 'quimiport.user';

export function getStoredUserJson(): string | null {
  return localStorage.getItem(userStorageKey);
}

export function getStoredUser(): UserResponseDto | null {
  try {
    const stored = getStoredUserJson();
    return stored ? (JSON.parse(stored) as UserResponseDto) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserResponseDto): void {
  localStorage.setItem(userStorageKey, JSON.stringify(user));
  window.dispatchEvent(new Event('quimiport.session-changed'));
}
