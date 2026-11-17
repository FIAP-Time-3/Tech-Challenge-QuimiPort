import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import configuration from '../configurations/configurations.js';

export function createSwaggerDocument(app: INestApplication) {
  const { swagger } = configuration();
  const options = new DocumentBuilder()
    .setTitle(swagger.title || 'QuimiPort API')
    .setDescription(
      `${swagger.description || 'API de produtos e cargas químicas.'}\n\n[Baixar OpenAPI JSON](/api/public/openapi.json)`,
    )
    .setVersion(swagger.version || '0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  // A ValidationPipe global rejeita campos fora dos DTOs de entrada.
  for (const path of Object.values(document.paths)) {
    for (const method of ['post', 'put', 'patch'] as const) {
      const body = path?.[method]?.requestBody;
      if (!body || !('content' in body)) continue;
      for (const media of Object.values(body.content)) {
        const schema = media.schema;
        if (!schema) continue;
        const target =
          '$ref' in schema
            ? document.components?.schemas?.[schema.$ref.split('/').at(-1)!]
            : schema;
        if (target && !('$ref' in target) && target.type === 'object') {
          (target as SchemaObject).additionalProperties = false;
        }
      }
    }
  }
  return document;
}

export function setupSwagger(
  app: INestApplication,
  publicDir = join(process.cwd(), 'public'),
) {
  const document = createSwaggerDocument(app);
  mkdirSync(publicDir, { recursive: true });
  const json = JSON.stringify(document, null, 2);
  writeFileSync(join(publicDir, 'openapi.json'), json);
  // Compatibilidade com o link antigo: este arquivo também contém OpenAPI, não Postman.
  writeFileSync(join(publicDir, 'collection.json'), json);
  SwaggerModule.setup('api/api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  return document;
}
