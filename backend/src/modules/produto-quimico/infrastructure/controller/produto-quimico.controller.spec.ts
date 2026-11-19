import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoQuimicoService } from '../../application/produto-quimico.service.js';
import { ProdutoQuimicoController } from './produto-quimico.controller.js';

describe('ProdutoQuimicoController', () => {
  let controller: ProdutoQuimicoController;
  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const body = {
    nome: 'Acetona',
    numeroONU: '1090',
    descricao: 'Solvente',
    classeRisco: 3,
    status: true,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoQuimicoController],
      providers: [{ provide: ProdutoQuimicoService, useValue: serviceMock }],
    }).compile();

    controller = module.get(ProdutoQuimicoController);
  });

  it('encaminha cadastro ao serviço', async () => {
    const result = { id: 1 };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(body)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith({ body });
  });

  it('encaminha paginação e ordenação ao serviço e devolve a página', async () => {
    const paginatedSort = { page: 2, limit: 5, column: 'nome', order: 'desc' };
    const result = { data: [], page: 2, limit: 5, total: 0, totalPages: 0 };
    serviceMock.findAll.mockResolvedValue(result);

    await expect(controller.findAll(paginatedSort)).resolves.toBe(result);
    expect(serviceMock.findAll).toHaveBeenCalledExactlyOnceWith({
      paginatedSort,
    });
  });

  it('encaminha id para busca', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 5 });

    await expect(controller.findOne(5)).resolves.toEqual({ id: 5 });
    expect(serviceMock.findOne).toHaveBeenCalledWith({ id: 5 });
  });

  it('encaminha id e dados para atualização', async () => {
    serviceMock.update.mockResolvedValue({ id: 5 });

    await expect(controller.update(5, body)).resolves.toEqual({ id: 5 });
    expect(serviceMock.update).toHaveBeenCalledWith({ id: 5, body });
  });

  it('encaminha id para remoção', async () => {
    serviceMock.remove.mockResolvedValue({ id: 5 });

    await expect(controller.remove(5)).resolves.toEqual({ id: 5 });
    expect(serviceMock.remove).toHaveBeenCalledWith({ id: 5 });
  });
});
