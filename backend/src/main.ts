import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import configuration from './configuration/configuration.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerOptions = new DocumentBuilder()
    .setTitle(configuration().swagger.title)
    .setDescription(configuration().swagger.description)
    .setVersion(configuration().swagger.version)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(configuration().application.port ?? 3000);
}
await bootstrap();
