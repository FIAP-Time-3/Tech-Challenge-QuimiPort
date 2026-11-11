import type { AuthSession } from '@/modules/auth/models/auth';

export const demoCredentials = {
  email: 'marina@quimiport.com.br',
  password: 'quimiport2026',
};

export const demoSession: AuthSession = {
  accessToken: 'demo-access-token',
  user: {
    id: 'demo-operator',
    name: 'Marina Costa',
    email: demoCredentials.email,
    role: 'Operações',
  },
};
