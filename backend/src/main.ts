import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import configuration from './infra/configurations/configurations.js';
import { DatabaseExceptionFilter } from './infra/filters/database-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

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
    .setTitle(configuration().swagger.title)
    .setDescription(configuration().swagger.description)
    .setVersion(configuration().swagger.version)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  app.useGlobalFilters(new DatabaseExceptionFilter());
  await app.listen(configuration().application.port ?? 3000);
}
await bootstrap();
