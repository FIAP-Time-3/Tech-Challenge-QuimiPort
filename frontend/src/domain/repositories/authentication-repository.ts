import type { User } from '@/domain/entities/user';

export interface AuthenticationRepository {
  authenticate(email: string, password: string): Promise<User | null>;
}
