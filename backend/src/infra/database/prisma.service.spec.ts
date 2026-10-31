import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adapterOptions: [] as unknown[],
  clientOptions: [] as unknown[],
  connect: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    constructor(options: unknown) {
      mocks.adapterOptions.push(options);
    }
  },
}));

vi.mock('./generated/prisma/client.js', () => ({
  PrismaClient: class {
    constructor(options: unknown) {
      mocks.clientOptions.push(options);
    }

    $connect = mocks.connect;
  },
}));

vi.mock('../configurations/configurations.js', () => ({
  default: () => ({ database: { url: 'postgresql://test/db' } }),
}));

describe('PrismaService', () => {
  beforeEach(() => {
    mocks.adapterOptions.length = 0;
    mocks.clientOptions.length = 0;
    mocks.connect.mockReset().mockResolvedValue(undefined);
  });

  it('configura adapter postgres e conecta ao inicializar', async () => {
    const { PrismaService } = await import('./prisma.service.js');
    const service = new PrismaService();

    expect(mocks.adapterOptions).toEqual([
      { connectionString: 'postgresql://test/db' },
    ]);
    expect(mocks.clientOptions).toHaveLength(1);
    expect(mocks.clientOptions[0]).toHaveProperty('adapter');

    await service.onModuleInit();
    expect(mocks.connect).toHaveBeenCalledOnce();
  });
});
