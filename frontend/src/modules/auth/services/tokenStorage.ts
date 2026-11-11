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
