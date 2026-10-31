import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;

  const prismaMock = { $queryRaw: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(HealthService);
  });

  it('informa que API e banco estão disponíveis', async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(service.getDbHealth()).resolves.toEqual({ database: true });

    const health = await service.getHealth();
    expect(health).toMatchObject({
      api: 'ok',
      status: 'ok',
      services: { database: true },
    });
    expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
    expect(health.uptime).toMatch(/^(?:\d+h )?\d+min$/);
  });

  it('formata uptime incluindo horas', async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);
    vi.spyOn(process, 'uptime').mockReturnValue(3_661);

    const health = await service.getHealth();

    expect(health.uptime).toBe('1h 1min');
  });

  it('informa estado degradado quando o banco não responde', async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error('database unavailable'));

    await expect(service.getDbHealth()).resolves.toEqual({ database: false });
    await expect(service.getHealth()).resolves.toMatchObject({
      api: 'ok',
      status: 'degraded',
      services: { database: false },
    });
  });
});
