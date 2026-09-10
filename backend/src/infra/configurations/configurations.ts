export default () => ({
  application: {
    port: Number(process.env.APP_PORT ?? 3000),
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
