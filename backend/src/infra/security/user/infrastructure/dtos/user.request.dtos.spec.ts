import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateFirstUserDto,
  CreateUserRequestDto,
  UpdateUserRequestDto,
} from './user.request.dtos.js';

async function invalidFields(
  dto: new () => object,
  input: Record<string, unknown>,
) {
  const errors = await validate(plainToInstance(dto, input));
  return errors.map((error) => error.property);
}

describe('validação dos DTOs de usuário', () => {
  it.each(['false', 0, 'active'])(
    'recusa status não booleano %s na edição',
    async (status) => {
      await expect(
        invalidFields(UpdateUserRequestDto, {
          name: 'Bruno',
          email: 'bruno@email.com',
          status,
        }),
      ).resolves.toContain('status');
    },
  );

  it('exige senha na criação e permite edição sem senha', async () => {
    const body = {
      name: 'Bruno',
      email: 'bruno@email.com',
    };
    await expect(invalidFields(CreateUserRequestDto, body)).resolves.toContain(
      'password',
    );
    await expect(
      invalidFields(UpdateUserRequestDto, { ...body, status: true }),
    ).resolves.toEqual([]);
  });

  it('rejeita senha na edição com a política de validação da API', async () => {
    const errors = await validate(
      plainToInstance(UpdateUserRequestDto, {
        name: 'Bruno',
        email: 'bruno@email.com',
        status: true,
        password: 'secret',
      }),
      { whitelist: true, forbidNonWhitelisted: true },
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'password',
          constraints: {
            whitelistValidation: 'property password should not exist',
          },
        }),
      ]),
    );
  });

  it.each(['name', 'email'])('exige %s na edição', async (field) => {
    const body: Record<string, unknown> = {
      name: 'Bruno',
      email: 'bruno@email.com',
    };
    delete body[field];
    await expect(invalidFields(UpdateUserRequestDto, body)).resolves.toContain(
      field,
    );
  });

  it('aceita dados válidos do primeiro administrador', async () => {
    await expect(
      invalidFields(CreateFirstUserDto, {
        email: 'admin@email.com',
        name: 'Administrador',
        password: 'secret',
      }),
    ).resolves.toEqual([]);
  });

  it.each(['email', 'name', 'password'])(
    'recusa criação inicial sem %s',
    async (field) => {
      const body: Record<string, unknown> = {
        email: 'admin@email.com',
        name: 'Administrador',
        password: 'secret',
      };
      delete body[field];

      await expect(invalidFields(CreateFirstUserDto, body)).resolves.toContain(
        field,
      );
    },
  );

  it('recusa status não booleano na criação', async () => {
    await expect(
      invalidFields(CreateUserRequestDto, {
        email: 'bruno@email.com',
        name: 'Bruno',
        password: 'secret',
        status: 'active',
      }),
    ).resolves.toContain('status');
  });
});

describe('status nas rotas por perfil', () => {
  const body = { name: 'Operador', email: 'operador@example.com' };

  it('assume status ativo no cadastro quando omitido', async () => {
    const dto = plainToInstance(CreateUserRequestDto, {
      ...body,
      password: 'secret',
    });

    expect(dto.status).toBe(true);
    expect(await validate(dto)).toEqual([]);
  });

  it.each([true, false])(
    'aceita status %s explícito na edição',
    async (status) => {
      await expect(
        invalidFields(UpdateUserRequestDto, { ...body, status }),
      ).resolves.toEqual([]);
    },
  );

  it.each([undefined, null, 'false'])(
    'recusa status %s na edição',
    async (status) => {
      const input = status === undefined ? body : { ...body, status };
      await expect(
        invalidFields(UpdateUserRequestDto, input),
      ).resolves.toContain('status');
    },
  );
});
