import type { User } from '@/domain/entities/user';
import type { AuthenticationRepository } from '@/domain/repositories/authentication-repository';

const demoUser: User = {
  id: 'demo-operator',
  name: 'Marina Costa',
  email: 'marina@quimiport.com.br',
  role: 'Operações',
};

export class FakeAuthenticationRepository implements AuthenticationRepository {
  async authenticate(email: string, password: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (email !== demoUser.email || password !== 'quimiport2026') {
      return null;
    }

    return demoUser;
  }
}
