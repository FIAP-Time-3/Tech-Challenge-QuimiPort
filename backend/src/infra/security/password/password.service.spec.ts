describe('PasswordService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('PASSWORD_SALT', '4');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('gera hash e verifica a senha original sem armazenar o texto puro', async () => {
    const { PasswordService } = await import('./password.service.js');
    const hash = await PasswordService.hash({ password: 'minha-senha' });

    expect(hash).not.toBe('minha-senha');
    await expect(
      PasswordService.compare({ hash, password: 'minha-senha' }),
    ).resolves.toBe(true);
    await expect(
      PasswordService.compare({ hash, password: 'senha-incorreta' }),
    ).resolves.toBe(false);
  });
});
