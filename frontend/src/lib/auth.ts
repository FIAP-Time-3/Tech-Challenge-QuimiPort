export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  user: User;
}

const accessTokenStorageKey = 'quimiport.access-token';
const demoAccessToken = 'demo-access-token';

const demoUser: User = {
  id: 'demo-operator',
  name: 'Marina Costa',
  email: 'marina@quimiport.com.br',
  role: 'Operações',
};

export async function authenticate(
  email: string,
  password: string,
): Promise<AuthSession | null> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (
    email.trim().toLocaleLowerCase('pt-BR') !== demoUser.email ||
    password !== 'quimiport2026'
  ) {
    return null;
  }

  return { accessToken: demoAccessToken, user: demoUser };
}

export function getAccessToken(): string | null {
  return localStorage.getItem(accessTokenStorageKey);
}

export function saveAccessToken(accessToken: string): void {
  localStorage.setItem(accessTokenStorageKey, accessToken);
}

export function clearAccessToken(): void {
  localStorage.removeItem(accessTokenStorageKey);
}

export async function validateAccessToken(
  accessToken: string,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return accessToken === demoAccessToken;
}
