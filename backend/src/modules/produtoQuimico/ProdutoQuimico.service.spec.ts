import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

describe('TestService', () => {
  let service: ProdutoQuimicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProdutoQuimicoService],
    }).compile();

    service = module.get<ProdutoQuimicoService>(ProdutoQuimicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
