import { Test, TestingModule } from '@nestjs/testing';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { CargaQuimicaController } from './CargaQuimica.controller.js';

describe('TestController', () => {
  let controller: CargaQuimicaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargaQuimicaController],
      providers: [
        {
          provide: CargaQuimicaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CargaQuimicaController>(CargaQuimicaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
