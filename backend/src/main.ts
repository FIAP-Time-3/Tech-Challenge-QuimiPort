import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import configuration from './infra/configurations/configurations.js';
import { DatabaseExceptionFilter } from './infra/filters/database-exception.filter.js';

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

  const swaggerOptions = new DocumentBuilder()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    .setTitle(configuration().swagger.title)
    .setDescription(configuration().swagger.description)
    .setVersion(configuration().swagger.version)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api/api-docs', app, swaggerDocument);

  app.useGlobalFilters(new DatabaseExceptionFilter());
  await app.listen(configuration().application.port ?? 3000);

  const logger = new Logger('Server');
  logger.log(
    `Serviço iniciado com sucesso: http://localhost:${configuration().application.port}`,
  );
  logger.log(
    `\n\nCaso seja o primeiro acesso\nrealizar criação do usuário admin inicial em:\nPOST> http://localhost:${configuration().application.port}/api/users/first_access\n
    {
      username: string;
      name: string;
      password: string;
    }
    `,
  );
}
await bootstrap();
