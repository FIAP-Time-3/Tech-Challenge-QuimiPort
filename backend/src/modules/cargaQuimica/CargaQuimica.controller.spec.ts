import { Test, TestingModule } from '@nestjs/testing';
import { CargaQuimicaController } from './CargaQuimica.controller.js';
import { CargaQuimicaService } from './CargaQuimica.service.js';

describe('TestController', () => {
  let controller: CargaQuimicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargaQuimicaController],
      providers: [CargaQuimicaService],
    }).compile();

    controller = module.get<CargaQuimicaController>(CargaQuimicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
