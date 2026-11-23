import { config } from 'dotenv';
import { configureTestDatabase } from './database-env.js';

const original = { ...process.env };
beforeEach(() => {
  process.env.TEST_DATABASE_HOSTNAME = 'localhost';
  process.env.TEST_DATABASE_PORT = '55432';
  process.env.TEST_DATABASE_USERNAME = 'test';
  process.env.TEST_DATABASE_PASSWORD = 'p@ss:word';
  process.env.TEST_DATABASE_NAME = 'isolated_test';
  process.env.DATABASE_NAME = 'application';
  process.env.DATABASE_URL = 'postgresql://localhost/application';
});
afterEach(() => {
  process.env = { ...original };
});

// Do not read local credential files while checking the reset guard.
vi.mock('dotenv', () => ({ config: vi.fn() }));

describe('proteção do reset do banco de integração', () => {
  it('carrega apenas o arquivo de ambiente padrão e respeita o ambiente do processo', () => {
    vi.mocked(config).mockClear();
    configureTestDatabase();

    expect(config).toHaveBeenCalledExactlyOnceWith({
      path: '.env',
      quiet: true,
    });
  });
  it('exige configuração exclusiva, sem fallback para a aplicação', () => {
    delete process.env.TEST_DATABASE_PASSWORD;
    expect(() => configureTestDatabase()).toThrow('TEST_DATABASE_PASSWORD');
  });
  it('recusa nomes que não terminam em _test', () => {
    process.env.TEST_DATABASE_NAME = 'production';
    expect(() => configureTestDatabase()).toThrow('Reset recusado');
  });
  it('recusa o nome do banco da aplicação', () => {
    process.env.DATABASE_NAME = 'isolated_test';
    expect(() => configureTestDatabase()).toThrow('Reset recusado');
  });
  it('recusa o nome indicado em DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/isolated_test';
    expect(() => configureTestDatabase()).toThrow('Reset recusado');
  });
  it('codifica as credenciais e não sobrescreve a conexão da aplicação', () => {
    const url = new URL(configureTestDatabase());
    expect(decodeURIComponent(url.password)).toBe('p@ss:word');
    expect(url.pathname).toBe('/isolated_test');
    expect(process.env.DATABASE_NAME).toBe('application');
    expect(process.env.DATABASE_URL).toBe('postgresql://localhost/application');
  });
});
