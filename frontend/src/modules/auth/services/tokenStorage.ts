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
}
