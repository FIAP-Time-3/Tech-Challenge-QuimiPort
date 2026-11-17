import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RolesEnum } from '../../../enums/roles.enum.js';
import {
  CreateFirstUserDto,
  CreateUserDto,
  UpdateUserDto,
} from './User.request.dtos.js';

async function invalidFields(
  dto: new () => object,
  input: Record<string, unknown>,
) {
  const errors = await validate(plainToInstance(dto, input));
  return errors.map((error) => error.property);
}

describe('validação dos DTOs de usuário', () => {
  it('exige senha na criação e permite edição sem senha', async () => {
    const body = { name: 'Bruno', email: 'bruno@email.com' };
    await expect(invalidFields(CreateUserDto, body)).resolves.toContain(
      'password',
    );
    await expect(invalidFields(UpdateUserDto, body)).resolves.toEqual([]);
  });

  it('rejeita senha na edição com a política de validação da API', async () => {
    const errors = await validate(
      plainToInstance(UpdateUserDto, {
        name: 'Bruno',
        email: 'bruno@email.com',
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
    await expect(invalidFields(UpdateUserDto, body)).resolves.toContain(field);
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

  it('aceita usuário com perfil válido e status booleano', async () => {
    await expect(
      invalidFields(CreateUserDto, {
        email: 'bruno@email.com',
        name: 'Bruno',
        password: 'secret',
        roles: [RolesEnum.OPERADOR, RolesEnum.TECNICO],
        status: false,
      }),
    ).resolves.toEqual([]);
  });

  it('aplica defaults para roles e status opcionais', () => {
    const user = plainToInstance(CreateUserDto, {
      email: 'bruno@email.com',
      name: 'Bruno',
      password: 'secret',
    });

    expect(user.roles).toBeUndefined();
    expect(user.status).toBe(true);
  });

  it('recusa perfil desconhecido e status não booleano', async () => {
    await expect(
      invalidFields(CreateUserDto, {
        email: 'bruno@email.com',
        name: 'Bruno',
        password: 'secret',
        roles: ['ROOT'],
        status: 'active',
      }),
    ).resolves.toEqual(expect.arrayContaining(['roles', 'status']));
  });
});
