import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ModulesContainer } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import type { SchemaObject, OperationObject } from '@nestjs/swagger';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../database/prisma.service.js';
import { createSwaggerDocument } from './swagger.js';

let app: INestApplication;
let doc: OpenAPIObject;

beforeAll(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue({})
    .compile();
  app = module.createNestApplication();
  app.setGlobalPrefix('api');
  doc = createSwaggerDocument(app);
});
afterAll(async () => {
  await app?.close();
});

function schema(name: string): SchemaObject {
  const result = doc.components?.schemas?.[name];
  expect(result, name).toBeDefined();
  return result as SchemaObject;
}
function operation(
  path: string,
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
) {
  const result = doc.paths[path]?.[method];
  expect(result, `${method} ${path}`).toBeDefined();
  return result!;
}

describe('contrato OpenAPI da API completa', () => {
  it('representa todas as rotas reais e sua política de acesso público', () => {
    const modules = app.get(ModulesContainer);
    const observed = new Set<string>();
    for (const module of modules.values()) {
      for (const { metatype } of module.controllers.values()) {
        if (!metatype) continue;
        const base = Reflect.getMetadata(PATH_METADATA, metatype) as string;
        for (const name of Object.getOwnPropertyNames(metatype.prototype)) {
          const handler = metatype.prototype[name];
          if (typeof handler !== 'function') continue;
          const route = Reflect.getMetadata(PATH_METADATA, handler) as
            | string
            | undefined;
          const verb = Reflect.getMetadata(METHOD_METADATA, handler) as
            | RequestMethod
            | undefined;
          if (route === undefined || verb === undefined) continue;
          const path = ('/api/' + [base, route].filter(Boolean).join('/'))
            .replace(/\/+/gu, '/')
            .replace(/\/$/u, '')
            .replace(/:(\w+)/gu, '{$1}');
          const method = RequestMethod[verb].toLowerCase() as 'get';
          const op = operation(path, method);
          const isPublic =
            Reflect.getMetadata('isPublic', metatype) ||
            Reflect.getMetadata('isPublic', handler);
          expect(op.security ?? doc.security, `${method} ${path}`).toEqual(
            isPublic ? [] : [{ jwt: [] }],
          );
          observed.add(`${method} ${path}`);
        }
      }
    }
    const documented = Object.entries(doc.paths).flatMap(([path, item]) =>
      Object.keys(item!)
        .filter((key) =>
          ['get', 'post', 'put', 'patch', 'delete'].includes(key),
        )
        .map((method) => `${method} ${path}`),
    );
    expect(new Set(documented)).toEqual(observed);
    expect(observed.size).toBeGreaterThan(25);
  });

  it('usa somente esquemas de segurança e referências existentes', () => {
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        if (key === '$ref') {
          expect(typeof child).toBe('string');
          const segments = (child as string).split('/').slice(1);
          let target: unknown = doc;
          for (const segment of segments)
            target = (target as Record<string, unknown>)?.[segment];
          expect(target, child as string).toBeDefined();
        } else visit(child);
      }
    };
    visit(doc);
    for (const path of Object.values(doc.paths)) {
      for (const op of Object.values(path!) as OperationObject[]) {
        for (const requirement of op.security ?? []) {
          for (const key of Object.keys(requirement))
            expect(doc.components?.securitySchemes).toHaveProperty(key);
        }
      }
    }
  });

  it('define schema de sucesso e operationId único em todas as operações', () => {
    const ids = new Set<string>();
    for (const [path, item] of Object.entries(doc.paths)) {
      for (const method of ['get', 'post', 'put', 'patch', 'delete'] as const) {
        if (!item?.[method]) continue;
        const op = item[method]!;
        expect(op.operationId).toBeTruthy();
        expect(ids.has(op.operationId!)).toBe(false);
        ids.add(op.operationId!);
        expect(op.summary, `${method} ${path}`).toBeTruthy();
        const code = method === 'post' ? '201' : '200';
        const response = op.responses[code];
        expect(response, `${method} ${path}`).toBeDefined();
        expect(
          response && 'content' in response && response.content,
        ).toBeTruthy();
        if (method === 'post') expect(op.responses).not.toHaveProperty('200');
      }
    }
    for (const [name, item] of Object.entries(doc.components?.schemas ?? {})) {
      if ('properties' in item)
        expect(Object.keys(item.properties ?? {}).length, name).toBeGreaterThan(
          0,
        );
    }
  });

  it('descreve criação e edição de usuário sem expor senha na resposta', () => {
    expect(schema('NewCreateUserDto').required).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
    expect(schema('NewCreateUserDto').properties).not.toHaveProperty('role');
    expect(schema('NewCreateUserDto').required).not.toContain('status');
    const update = schema('NewUpdateUserDto');
    expect(update.required).toEqual(
      expect.arrayContaining(['name', 'email', 'status']),
    );
    expect(update.properties).not.toHaveProperty('password');
    expect(update.additionalProperties).toBe(false);
    expect(schema('LoginRequestDto').additionalProperties).toBe(false);
    expect(update.properties?.status).not.toHaveProperty('default');
    expect(schema('NewCreateUserDto').properties?.status).toMatchObject({
      default: true,
    });
    expect(schema('UserResponseDto').properties?.role).toMatchObject({
      type: 'string',
    });
    expect(schema('UserResponseDto').properties).not.toHaveProperty('password');
    expect(schema('UserResponseDto').properties).not.toHaveProperty('username');
    expect(schema('UserResponseDto').properties).toHaveProperty('email');
    expect(schema('LoginRequestDto').properties).toHaveProperty('email');
    expect(schema('LoginResponseDto').properties).toHaveProperty(
      'access_token',
    );
    expect(schema('LoginResponseDto').properties).toHaveProperty(
      'refresh_token',
    );
  });

  it('descreve numeroONU, opcionais, objetos relacionados e datas', () => {
    expect(
      schema('CreateOrUpdateProdutoQuimicoDto').properties?.numeroONU,
    ).toMatchObject({
      type: 'string',
      minLength: 4,
      maxLength: 4,
      pattern: '^(?!0000)[0-9]{4}$',
    });
    expect(schema('CreateOrUpdateProdutoQuimicoDto').required).not.toContain(
      'descricao',
    );
    expect(schema('CreateOrUpdateProdutoQuimicoDto').required).not.toContain(
      'status',
    );
    expect(schema('ProdutoResumoDto').properties).toHaveProperty('numeroONU');
    expect(
      schema('CargaQuimicaResponseDto').properties?.documentos,
    ).toMatchObject({
      type: 'array',
      items: { $ref: '#/components/schemas/DocumentoResponseDto' },
    });
    expect(
      schema('CargaQuimicaResponseDto').properties?.dataEntrada,
    ).toMatchObject({ type: 'string', format: 'date-time' });
    expect(
      schema('CargaQuimicaResponseDto').properties?.responsavelTecnicoId,
    ).toMatchObject({ type: 'integer', nullable: true });
    expect(schema('CreateOrUpdateCargaQuimicaDto').required).not.toContain(
      'dataEntrada',
    );
    expect(schema('MovimentacaoResponseDto').properties?.notes).toMatchObject({
      nullable: true,
    });
    expect(schema('HealthResponseDto').properties).toHaveProperty('services');
  });

  it('descreve multipart, limite e download binário de PDF', () => {
    const upload = operation('/api/cargas-quimicas/{id}/documentos', 'post');
    const body = upload.requestBody;
    expect(
      body && 'content' in body && body.content['multipart/form-data'],
    ).toMatchObject({
      schema: {
        required: ['tipoDocumento', 'arquivo'],
        properties: { arquivo: { type: 'string', format: 'binary' } },
      },
    });
    expect(upload.responses).toHaveProperty('413');
    const download = operation(
      '/api/cargas-quimicas/{id}/documentos/{docId}',
      'get',
    );
    expect(download.responses['200']).toMatchObject({
      content: {
        'application/pdf': { schema: { type: 'string', format: 'binary' } },
      },
    });
    expect(
      operation('/api/public/{file}', 'get').responses['200'],
    ).toMatchObject({ content: { 'application/json': expect.any(Object) } });
  });
});
