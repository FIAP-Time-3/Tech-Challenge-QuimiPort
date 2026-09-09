import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../database/prisma.service.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

describe('TestService', () => {
  let service: ProdutoQuimicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoQuimicoService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProdutoQuimicoService>(ProdutoQuimicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
