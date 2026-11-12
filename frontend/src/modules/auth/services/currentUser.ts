import { getAccessToken } from './tokenStorage';

export function getCurrentUser() {
  try {
    const payload = getAccessToken()?.split('.')[1];
    if (!payload) throw new Error('Sessão ausente');
    const bytes = Uint8Array.from(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      (char) => char.charCodeAt(0),
    );
    const claims = JSON.parse(new TextDecoder().decode(bytes)) as {
      username: string;
      roles: string[];
    };
    const name = claims.username;
    return {
      name,
      role: claims.roles.join(', '),
      initials: name.slice(0, 2).toLocaleUpperCase('pt-BR'),
    };
  } catch {
    return { name: 'Usuário', role: '', initials: 'U' };
  }
}
