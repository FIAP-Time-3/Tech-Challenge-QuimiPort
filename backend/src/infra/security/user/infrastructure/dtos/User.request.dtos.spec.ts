import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RolesEnum } from '../../../enums/roles.enum.js';
import {
  CreateFirstUserDto,
  CreateOrUpdateUserDto,
} from './User.request.dtos.js';

async function invalidFields(
  dto: new () => object,
  input: Record<string, unknown>,
) {
  const errors = await validate(plainToInstance(dto, input));
  return errors.map((error) => error.property);
}

describe('validação dos DTOs de usuário', () => {
  it('aceita dados válidos do primeiro administrador', async () => {
    await expect(
      invalidFields(CreateFirstUserDto, {
        username: 'admin',
        name: 'Administrador',
        password: 'secret',
      }),
    ).resolves.toEqual([]);
  });

  it.each(['username', 'name', 'password'])(
    'recusa criação inicial sem %s',
    async (field) => {
      const body: Record<string, unknown> = {
        username: 'admin',
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
      invalidFields(CreateOrUpdateUserDto, {
        username: 'bruno',
        name: 'Bruno',
        password: 'secret',
        roles: [RolesEnum.OPERADOR, RolesEnum.TECNICO],
        status: false,
      }),
    ).resolves.toEqual([]);
  });

  it('aplica defaults para roles e status opcionais', () => {
    const user = plainToInstance(CreateOrUpdateUserDto, {
      username: 'bruno',
      name: 'Bruno',
      password: 'secret',
    });

    expect(user.roles).toBeUndefined();
    expect(user.status).toBe(true);
  });

  it('recusa perfil desconhecido e status não booleano', async () => {
    await expect(
      invalidFields(CreateOrUpdateUserDto, {
        username: 'bruno',
        name: 'Bruno',
        password: 'secret',
        roles: ['ROOT'],
        status: 'active',
      }),
    ).resolves.toEqual(expect.arrayContaining(['roles', 'status']));
  });
});
