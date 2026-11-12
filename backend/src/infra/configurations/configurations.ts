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
    hostname: process.env.DATABASE_HOSTNAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    name: process.env.DATABASE_NAME,
    url: `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOSTNAME}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?schema=public`,
  },
});
