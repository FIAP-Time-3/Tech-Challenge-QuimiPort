import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RolesEnum } from '../../../enums/roles.enum.js';
import {
  CreateFirstUserDto,
  NewCreateUserDto,
  CreateUserDto,
  NewUpdateUserDto,
  UpdateUserDto,
} from './user.request.dtos.js';

async function invalidFields(
  dto: new () => object,
  input: Record<string, unknown>,
) {
  const errors = await validate(plainToInstance(dto, input));
  return errors.map((error) => error.property);
}

describe('validação dos DTOs de usuário', () => {
  it('aplica status true somente na criação e mantém indefinido na edição', async () => {
    const body = {
      name: 'Bruno',
      email: 'bruno@email.com',
      role: RolesEnum.OPERADOR,
    };
    expect(
      plainToInstance(CreateUserDto, { ...body, password: 'secret' }).status,
    ).toBe(true);
    const updated = plainToInstance(UpdateUserDto, body);
    expect(updated.status).toBeUndefined();
    expect(updated.role).toBe(RolesEnum.OPERADOR);
    expect(await validate(updated)).toEqual([]);
  });

  it.each([true, false])(
    'aceita status explícito %s na edição',
    async (status) => {
      const dto = plainToInstance(UpdateUserDto, {
        name: 'Bruno',
        email: 'bruno@email.com',
        role: RolesEnum.OPERADOR,
        status,
      });
      expect(await validate(dto)).toEqual([]);
      expect(dto.status).toBe(status);
    },
  );

  it.each(['false', 0, 'active'])(
    'recusa status não booleano %s na edição',
    async (status) => {
      await expect(
        invalidFields(UpdateUserDto, {
          name: 'Bruno',
          email: 'bruno@email.com',
          role: RolesEnum.OPERADOR,
          status,
        }),
      ).resolves.toContain('status');
    },
  );

  it('exige senha na criação e permite edição sem senha', async () => {
    const body = {
      name: 'Bruno',
      email: 'bruno@email.com',
      role: RolesEnum.OPERADOR,
    };
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
        role: RolesEnum.OPERADOR,
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
      role: RolesEnum.OPERADOR,
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
        role: RolesEnum.OPERADOR,
        name: 'Bruno',
        password: 'secret',
        status: false,
      }),
    ).resolves.toEqual([]);
  });

  it('aplica status ativo por padrão', () => {
    const user = plainToInstance(CreateUserDto, {
      email: 'bruno@email.com',
      role: RolesEnum.OPERADOR,
      name: 'Bruno',
      password: 'secret',
    });

    expect(user.role).toBe(RolesEnum.OPERADOR);
    expect(user.status).toBe(true);
  });

  it('recusa perfil desconhecido e status não booleano', async () => {
    await expect(
      invalidFields(CreateUserDto, {
        email: 'bruno@email.com',
        name: 'Bruno',
        password: 'secret',
        role: 'ROOT',
        status: 'active',
      }),
    ).resolves.toEqual(expect.arrayContaining(['role', 'status']));
  });
});

describe('validação dos DTOs de operador', () => {
  const body = { name: 'Operador', email: 'operador@example.com' };

  it('assume status ativo no cadastro quando omitido', async () => {
    const dto = plainToInstance(NewCreateUserDto, {
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
        invalidFields(NewUpdateUserDto, { ...body, status }),
      ).resolves.toEqual([]);
    },
  );

  it.each([undefined, null, 'false'])(
    'recusa status %s na edição',
    async (status) => {
      const input = status === undefined ? body : { ...body, status };
      await expect(invalidFields(NewUpdateUserDto, input)).resolves.toContain(
        'status',
      );
    },
  );
});
