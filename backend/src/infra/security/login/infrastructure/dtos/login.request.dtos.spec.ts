import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginRequestDto, RefreshRequestDto } from './login.request.dtos.js';

async function invalidFields(
  dto: new () => object,
  input: Record<string, unknown>,
) {
  const errors = await validate(plainToInstance(dto, input));
  return errors.map((error) => error.property);
}

describe('validação dos DTOs de autenticação', () => {
  it('aceita credenciais de login válidas', async () => {
    await expect(
      invalidFields(LoginRequestDto, {
        username: 'bruno',
        password: 'secret',
      }),
    ).resolves.toEqual([]);
  });

  it.each(['username', 'password'])('recusa login sem %s', async (field) => {
    const body: Record<string, unknown> = {
      username: 'bruno',
      password: 'secret',
    };
    delete body[field];

    await expect(invalidFields(LoginRequestDto, body)).resolves.toContain(
      field,
    );
  });

  it('recusa campos vazios ou não textuais no login', async () => {
    await expect(
      invalidFields(LoginRequestDto, { username: '', password: 123 }),
    ).resolves.toEqual(expect.arrayContaining(['username', 'password']));
  });

  it('aceita refresh token textual e não vazio', async () => {
    await expect(
      invalidFields(RefreshRequestDto, { refresh_token: 'refresh-token' }),
    ).resolves.toEqual([]);
  });

  it('recusa refresh token ausente ou vazio', async () => {
    await expect(invalidFields(RefreshRequestDto, {})).resolves.toContain(
      'refresh_token',
    );
    await expect(
      invalidFields(RefreshRequestDto, { refresh_token: '' }),
    ).resolves.toContain('refresh_token');
  });
});
