import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoQuimicoService } from '../../application/ProdutoQuimico.service.js';
import { ProdutoQuimicoController } from './ProdutoQuimico.controller.js';

describe('TestController', () => {
  let controller: ProdutoQuimicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoQuimicoController],
      providers: [
        {
          provide: ProdutoQuimicoService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProdutoQuimicoController>(ProdutoQuimicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
