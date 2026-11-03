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
    username: 'bruno',
    name: 'Bruno Dias',
    password: 'secret',
    roles: [RolesEnum.OPERADOR],
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
      username: 'admin',
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
    serviceMock.findAll.mockResolvedValue([{ id: 1 }]);
    serviceMock.findOne.mockResolvedValue({ id: 1 });

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    expect(serviceMock.findAll).toHaveBeenCalledOnce();
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
