import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

describe('ProdutoQuimicoService', () => {
  let service: ProdutoQuimicoService;

  const prismaMock = {
    produtosQuimicos: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    cargaQuimicas: { count: vi.fn() },
  };

  const body = {
    nome: 'Acetona',
    descricao: 'Solvente',
    classeRisco: 3,
    status: true,
  };
  const product = { id: 1, ...body };

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

  describe('create', () => {
    it('cadastra um produto químico válido e devolve o registro', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.create.mockResolvedValue({ id: 1 });
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(product);

      await expect(service.create({ body })).resolves.toMatchObject(product);
      expect(prismaMock.produtosQuimicos.create).toHaveBeenCalledWith({
        data: body,
      });
    });

    it('recusa nome duplicado sem criar produto', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(1);

      await expect(service.create({ body })).rejects.toThrow(ConflictException);
      expect(prismaMock.produtosQuimicos.create).not.toHaveBeenCalled();
    });
  });

  describe('queries', () => {
    it('lista produtos', async () => {
      prismaMock.produtosQuimicos.findMany.mockResolvedValue([product]);

      await expect(service.findAll()).resolves.toMatchObject([product]);
      expect(prismaMock.produtosQuimicos.findMany).toHaveBeenCalledOnce();
    });

    it('busca produto por id', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(product);

      await expect(service.findOne({ id: 1 })).resolves.toMatchObject(product);
      expect(prismaMock.produtosQuimicos.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('devolve 404 ao buscar produto inexistente', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(null);

      await expect(service.findOne({ id: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('atualiza produto existente e retorna os dados atualizados', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.findUnique
        .mockResolvedValueOnce(product)
        .mockResolvedValueOnce({ ...product, descricao: 'Removedor' });
      prismaMock.produtosQuimicos.update.mockResolvedValue({
        ...product,
        descricao: 'Removedor',
      });

      await expect(
        service.update({
          id: 1,
          body: { ...body, descricao: 'Removedor' },
        }),
      ).resolves.toMatchObject({ descricao: 'Removedor' });

      expect(prismaMock.produtosQuimicos.count).toHaveBeenCalledWith({
        where: {
          nome: { equals: 'Acetona', mode: 'insensitive' },
          NOT: { id: 1 },
        },
      });
      expect(prismaMock.produtosQuimicos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...body, descricao: 'Removedor' },
      });
    });

    it('permite preservar o próprio nome durante a atualização', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.findUnique
        .mockResolvedValueOnce(product)
        .mockResolvedValueOnce(product);
      prismaMock.produtosQuimicos.update.mockResolvedValue(product);

      await service.update({ id: 1, body });

      expect(prismaMock.produtosQuimicos.count).toHaveBeenCalledWith({
        where: {
          nome: { equals: 'Acetona', mode: 'insensitive' },
          NOT: { id: 1 },
        },
      });
    });

    it('recusa nome já usado por outro produto', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(1);

      await expect(service.update({ id: 1, body })).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.produtosQuimicos.update).not.toHaveBeenCalled();
    });

    it('devolve 404 ao atualizar produto inexistente', async () => {
      prismaMock.produtosQuimicos.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(null);

      await expect(service.update({ id: 99, body })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.produtosQuimicos.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('remove produto sem cargas associadas', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(product);
      prismaMock.cargaQuimicas.count.mockResolvedValue(0);
      prismaMock.produtosQuimicos.delete.mockResolvedValue({ id: 1 });

      await expect(service.remove({ id: 1 })).resolves.toEqual({ id: 1 });
      expect(prismaMock.cargaQuimicas.count).toHaveBeenCalledWith({
        where: { produtoQuimicoId: 1 },
      });
      expect(prismaMock.produtosQuimicos.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('recusa remover produto associado a cargas', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(product);
      prismaMock.cargaQuimicas.count.mockResolvedValue(2);

      await expect(service.remove({ id: 1 })).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.produtosQuimicos.delete).not.toHaveBeenCalled();
    });

    it('devolve 404 ao remover produto inexistente', async () => {
      prismaMock.produtosQuimicos.findUnique.mockResolvedValue(null);

      await expect(service.remove({ id: 99 })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.cargaQuimicas.count).not.toHaveBeenCalled();
    });
  });
});
