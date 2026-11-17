function tokenMinutes(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    !Number.isSafeInteger(value * 60)
  ) {
    throw new Error(`${name} deve ser um número inteiro positivo de minutos`);
  }
  return value;
}

function databaseEnv(field: string) {
  const prefix =
    process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_NAME
      ? 'TEST_DATABASE_'
      : 'DATABASE_';
  return process.env[`${prefix}${field}`];
}

export default () => ({
  application: {
    port: Number(process.env.APP_PORT ?? 3000),
  },
  password: { salt: Number(process.env.PASSWORD_SALT) },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenMinutes: tokenMinutes('JWT_ACCESS_TOKEN_MINUTES', 60),
    refreshTokenMinutes: tokenMinutes('JWT_REFRESH_TOKEN_MINUTES', 4320),
  },
  swagger: {
    title: process.env.SWAGGER_TITLE ?? '',
    description: process.env.SWAGGER_DESCRIPTION ?? '',
    version: process.env.SWAGGER_VERSION ?? '',
  },
  database: {
    hostname: databaseEnv('HOSTNAME'),
    username: databaseEnv('USERNAME'),
    password: databaseEnv('PASSWORD'),
    port: databaseEnv('PORT'),
    name: databaseEnv('NAME'),
    url: `postgresql://${encodeURIComponent(databaseEnv('USERNAME') ?? '')}:${encodeURIComponent(databaseEnv('PASSWORD') ?? '')}@${databaseEnv('HOSTNAME')}:${databaseEnv('PORT')}/${databaseEnv('NAME')}?schema=public`,
  },
});
