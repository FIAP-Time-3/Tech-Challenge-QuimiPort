import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;
  const serviceMock = {
    getHealth: vi.fn(),
    getDbHealth: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: serviceMock }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('delegates overall health check', async () => {
    const health = { status: 'ok' };
    serviceMock.getHealth.mockResolvedValue(health);

    await expect(controller.getHealth()).resolves.toBe(health);
    expect(serviceMock.getHealth).toHaveBeenCalledOnce();
  });

  it('delegates database health check', async () => {
    const health = { database: false };
    serviceMock.getDbHealth.mockResolvedValue(health);

    await expect(controller.getDbHealth()).resolves.toBe(health);
    expect(serviceMock.getDbHealth).toHaveBeenCalledOnce();
  });
});
