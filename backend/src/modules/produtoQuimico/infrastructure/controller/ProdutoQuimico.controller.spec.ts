import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoQuimicoService } from '../../application/ProdutoQuimico.service.js';
import { ProdutoQuimicoController } from './ProdutoQuimico.controller.js';

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

  it('encaminha listagem ao serviço', async () => {
    serviceMock.findAll.mockResolvedValue([]);

    await expect(controller.findAll()).resolves.toEqual([]);
    expect(serviceMock.findAll).toHaveBeenCalledOnce();
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
