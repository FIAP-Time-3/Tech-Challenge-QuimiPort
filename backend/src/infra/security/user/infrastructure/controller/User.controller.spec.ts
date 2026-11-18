import { Test, TestingModule } from '@nestjs/testing';
import { RolesEnum } from '../../../enums/roles.enum.js';
import { UserService } from '../../application/User.service.js';
import { UserController } from './User.controller.js';

describe('UserController', () => {
  let controller: UserController;
  const serviceMock = {
    createFirst: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  const userBody = {
    email: 'bruno@email.com',
    name: 'Bruno Dias',
    password: 'secret',
    role: RolesEnum.OPERADOR,
    status: true,
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: serviceMock }],
    }).compile();

    controller = module.get(UserController);
  });

  it('encaminha criação do administrador inicial', async () => {
    const firstUser = {
      email: 'admin@email.com',
      name: 'Admin',
      password: 'secret',
    };
    serviceMock.createFirst.mockResolvedValue({ id: 1 });

    await expect(controller.createFirstAdmin(firstUser)).resolves.toEqual({
      id: 1,
    });
    expect(serviceMock.createFirst).toHaveBeenCalledWith({ body: firstUser });
  });

  it('encaminha operações de consulta de usuário', async () => {
    const paginatedSort = { page: 2, limit: 5, column: 'name', order: 'desc' };
    const result = {
      data: [{ id: 1 }],
      page: 2,
      limit: 5,
      total: 6,
      totalPages: 2,
    };
    serviceMock.findAll.mockResolvedValue(result);
    serviceMock.findOne.mockResolvedValue({ id: 1 });

    await expect(controller.findAll(paginatedSort)).resolves.toEqual(result);
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    expect(serviceMock.findAll).toHaveBeenCalledExactlyOnceWith({
      paginatedSort,
    });
    expect(serviceMock.findOne).toHaveBeenCalledWith({ id: 1 });
  });

  it('encaminha criação e atualização de usuário', async () => {
    serviceMock.create.mockResolvedValue({ id: 1 });
    serviceMock.update.mockResolvedValue({ id: 1 });

    await expect(controller.create(userBody)).resolves.toEqual({ id: 1 });
    await expect(controller.update(1, userBody)).resolves.toEqual({ id: 1 });
    expect(serviceMock.create).toHaveBeenCalledWith({ body: userBody });
    expect(serviceMock.update).toHaveBeenCalledWith({ id: 1, body: userBody });
  });

  it('encaminha id para desativação', async () => {
    serviceMock.remove.mockResolvedValue({ id: 1 });

    await expect(controller.remove(1)).resolves.toEqual({ id: 1 });
    expect(serviceMock.remove).toHaveBeenCalledWith({ id: 1 });
  });
});
