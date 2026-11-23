import { config } from 'dotenv';

export function configureTestDatabase() {
  config({ path: '.env', quiet: true });
  const fields = ['HOSTNAME', 'PORT', 'NAME', 'USERNAME', 'PASSWORD'] as const;
  for (const field of fields) {
    if (!process.env[`TEST_DATABASE_${field}`]) {
      throw new Error(
        `Configure TEST_DATABASE_${field} no .env usado pelo backend ou no ambiente.`,
      );
    }
  }
  const name = process.env.TEST_DATABASE_NAME!;
  if (
    !/^[a-zA-Z0-9_]+_test$/.test(name) ||
    name === process.env.DATABASE_NAME
  ) {
    throw new Error(
      'Reset recusado: o banco deve terminar em _test e diferir de DATABASE_NAME.',
    );
  }
  const url = new URL('postgresql://localhost');
  url.hostname = process.env.TEST_DATABASE_HOSTNAME!;
  url.port = process.env.TEST_DATABASE_PORT!;
  url.username = process.env.TEST_DATABASE_USERNAME!;
  url.password = process.env.TEST_DATABASE_PASSWORD!;
  url.pathname = `/${name}`;
  url.searchParams.set('schema', 'public');
  const applicationUrl = process.env.DATABASE_URL;
  if (
    applicationUrl &&
    decodeURIComponent(new URL(applicationUrl).pathname) === `/${name}`
  ) {
    throw new Error(
      'Reset recusado: TEST_DATABASE_NAME coincide com DATABASE_URL.',
    );
  }
  process.env.NODE_ENV = 'test';
  process.env.PASSWORD_SALT = '4';
  process.env.JWT_SECRET = 'integration-test-secret';
  return url.toString();
}
