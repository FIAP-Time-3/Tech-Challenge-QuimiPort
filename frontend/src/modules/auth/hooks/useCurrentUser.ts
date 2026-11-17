import { useSyncExternalStore } from 'react';
import {
  getStoredUser,
  getStoredUserJson,
} from '@/modules/auth/services/token.storage';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener('quimiport.session-changed', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('quimiport.session-changed', onChange);
  };
}

export function getCurrentUser() {
  const user = getStoredUser();
  if (!user) return { name: 'Usuário', role: '', initials: 'U' };
  const name = user.name || user.username;
  const words = name.trim().split(/\s+/u);
  const initials = (
    words.length > 1
      ? words[0][0] + words[words.length - 1][0]
      : name.slice(0, 2)
  ).toLocaleUpperCase('pt-BR');
  return { name, role: user.roles.join(', '), initials };
}

export function useCurrentUser() {
  useSyncExternalStore(subscribe, getStoredUserJson);
  return getCurrentUser();
}
