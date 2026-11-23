import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import configuration from './infra/configurations/configurations.js';
import { DatabaseExceptionFilter } from './infra/filters/database-exception.filter.js';
import { setupSwagger } from './infra/swagger/swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  setupSwagger(app);

  app.useGlobalFilters(new DatabaseExceptionFilter());
  await app.listen(configuration().application.port ?? 3000);

  const logger = new Logger('Server');
  logger.log(
    `Serviço iniciado com sucesso: http://localhost:${configuration().application.port}`,
  );

  logger.log(
    `\n\nCaso seja o primeiro acesso\nrealizar criação do usuário admin inicial em:\nPOST> http://localhost:${configuration().application.port}/api/users/first_access\n
    {
      email: string;
      name: string;
      password: string;
    }
    `,
  );
}
await bootstrap();
