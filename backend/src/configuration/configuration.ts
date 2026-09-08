export default () => ({
  application: {
    port: Number(process.env.APP_PORT ?? 3000),
  },
  swagger: {
    title: process.env.SWAGGER_TITLE ?? '',
    description: process.env.SWAGGER_DESCRIPTION ?? '',
    version: process.env.SWAGGER_VERSION ?? '',
  },
});
