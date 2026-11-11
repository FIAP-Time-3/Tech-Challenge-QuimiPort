import type { User } from '@/domain/entities/user';
import type { AuthenticationRepository } from '@/domain/repositories/authentication-repository';

export interface SignInCredentials {
  email: string;
  password: string;
}

export class SignInUseCase {
  private readonly authenticationRepository: AuthenticationRepository;

  constructor(authenticationRepository: AuthenticationRepository) {
    this.authenticationRepository = authenticationRepository;
  }

  execute({ email, password }: SignInCredentials): Promise<User | null> {
    const normalizedEmail = email.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedEmail || !password) {
      return Promise.resolve(null);
    }

    return this.authenticationRepository.authenticate(
      normalizedEmail,
      password,
    );
  }
}
