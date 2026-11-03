import { Test, TestingModule } from '@nestjs/testing';
import { ApiService } from '../../application/Api.service.js';
import { ApiController } from './Api.controller.js';

describe('ApiController', () => {
  let controller: ApiController;
  const serviceMock = { getPublicFile: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [{ provide: ApiService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ApiController);
  });

  it('encaminha o nome do arquivo ao serviço', async () => {
    const file = {};
    serviceMock.getPublicFile.mockResolvedValue(file);

    await expect(controller.getPublicFile('collection.json')).resolves.toBe(
      file,
    );
    expect(serviceMock.getPublicFile).toHaveBeenCalledWith({
      filename: 'collection.json',
    });
  });
});
