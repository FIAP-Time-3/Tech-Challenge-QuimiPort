import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { CargaQuimicaService } from './CargaQuimica.service.js';

describe('CargaQuimicaService', () => {
  let service: CargaQuimicaService;

  const prismaMock = {
    produtosQuimicos: { findUnique: vi.fn() },
    cargaQuimicas: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    movimentacoes: { create: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  };

  const body = {
    produtoQuimicoId: 1,
    quantidade: 100,
    unidadeMedida: 'kg',
    destino: 'Santos',
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      (cb: (tx: unknown) => unknown) => cb(prismaMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargaQuimicaService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(CargaQuimicaService);
  });

  it('cria carga CADASTRADA, herda a classe do produto e registra step 1 (CT-06)', async () => {
    prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
      id: 1,
      status: true,
      classeRisco: 3,
    });
    prismaMock.cargaQuimicas.create.mockResolvedValue({ id: 10 });
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
      id: 10,
      ...body,
      statusCarga: 'CADASTRADA',
      classeRiscoONU: 3,
    });

    const result = await service.create({ body });

    expect(prismaMock.cargaQuimicas.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        statusCarga: 'CADASTRADA',
        classeRiscoONU: 3,
      }),
    });
    expect(prismaMock.movimentacoes.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cargaQuimicaId: 10,
        step: 1,
        statusAnterior: null,
        statusAtual: 'CADASTRADA',
      }),
    });
    expect(result.id).toBe(10);
  });

  it('recusa produto inativo (CT-08)', async () => {
    prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
      id: 1,
      status: false,
      classeRisco: 3,
    });

    await expect(service.create({ body })).rejects.toThrow(
      BadRequestException,
    );
    expect(prismaMock.cargaQuimicas.create).not.toHaveBeenCalled();
  });

  it('recusa produto inexistente', async () => {
    prismaMock.produtosQuimicos.findUnique.mockResolvedValue(null);

    await expect(service.create({ body })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('recusa trocar o produto fora de CADASTRADA (CT-11)', async () => {
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
      id: 10,
      produtoQuimicoId: 1,
      statusCarga: 'EM_PREPARACAO',
      classeRiscoONU: 3,
    });

    await expect(
      service.update({ id: 10, body: { ...body, produtoQuimicoId: 2 } }),
    ).rejects.toThrow(ConflictException);
    expect(prismaMock.cargaQuimicas.update).not.toHaveBeenCalled();
  });

  it('recusa alterar carga em estado terminal', async () => {
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
      id: 10,
      produtoQuimicoId: 1,
      statusCarga: 'FINALIZADA',
      classeRiscoONU: 3,
    });

    await expect(service.update({ id: 10, body })).rejects.toThrow(
      ConflictException,
    );
  });

  it('troca o produto em CADASTRADA e atualiza a classe herdada (CT-10)', async () => {
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
      id: 10,
      produtoQuimicoId: 1,
      statusCarga: 'CADASTRADA',
      classeRiscoONU: 3,
    });
    prismaMock.produtosQuimicos.findUnique.mockResolvedValue({
      id: 2,
      status: true,
      classeRisco: 8,
    });

    await service.update({ id: 10, body: { ...body, produtoQuimicoId: 2 } });

    expect(prismaMock.cargaQuimicas.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: expect.objectContaining({
        produtoQuimicoId: 2,
        classeRiscoONU: 8,
      }),
    });
  });

  it('só exclui carga CADASTRADA', async () => {
    prismaMock.cargaQuimicas.findUnique.mockResolvedValue({
      id: 10,
      statusCarga: 'LIBERADA',
    });

    await expect(service.remove({ id: 10 })).rejects.toThrow(
      ConflictException,
    );
    expect(prismaMock.cargaQuimicas.delete).not.toHaveBeenCalled();
  });
});