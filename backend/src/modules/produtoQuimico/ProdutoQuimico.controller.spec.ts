import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoQuimicoController } from './ProdutoQuimico.controller.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

describe('TestController', () => {
  let controller: ProdutoQuimicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoQuimicoController],
      providers: [ProdutoQuimicoService],
    }).compile();

    controller = module.get<ProdutoQuimicoController>(ProdutoQuimicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
