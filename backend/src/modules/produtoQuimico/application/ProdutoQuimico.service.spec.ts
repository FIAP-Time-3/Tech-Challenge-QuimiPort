import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

describe('ProdutoQuimicoService', () => {
  let service: ProdutoQuimicoService;

  const prismaMock = {
    produtosQuimicos: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  const body = {
    nome: 'Acetona',
    descricao: 'Solvente',
    classeRisco: 3,
    status: true,
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoQuimicoService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(ProdutoQuimicoService);
  });

  it('cadastra um produto químico válido', async () => {
    prismaMock.produtosQuimicos.count.mockResolvedValue(0);
    prismaMock.produtosQuimicos.create.mockResolvedValue({ id: 1 });
    prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
      id: 1,
      ...body,
    });

    await service.create({ body });

    expect(prismaMock.produtosQuimicos.create).toHaveBeenCalledWith({
      data: body,
    });
  });

  it('recusa nome duplicado', async () => {
    prismaMock.produtosQuimicos.count.mockResolvedValue(1);

    await expect(service.create({ body })).rejects.toThrow(ConflictException);
    expect(prismaMock.produtosQuimicos.create).not.toHaveBeenCalled();
  });
});
