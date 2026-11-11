export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const demoUser: User = {
  id: 'demo-operator',
  name: 'Marina Costa',
  email: 'marina@quimiport.com.br',
  role: 'Operações',
};

export async function authenticate(
  email: string,
  password: string,
): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (
    email.trim().toLocaleLowerCase('pt-BR') !== demoUser.email ||
    password !== 'quimiport2026'
  ) {
    return null;
  }

  return demoUser;
}
