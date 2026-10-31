import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import { UserService } from './User.service.js';

describe('UserService', () => {
  let service: UserService;

  const prismaMock = {
    user: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  const userBody = {
    username: 'bruno',
    name: 'Bruno Dias',
    password: 'secret',
    roles: [RolesEnum.OPERADOR],
    status: true,
  };
  let hashPassword: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
    hashPassword = vi
      .spyOn(PasswordService, 'hash')
      .mockResolvedValue('hashed');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createFirst', () => {
    it('cria o primeiro usuário como administrador ativo', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.create.mockResolvedValue({
        ...userBody,
        password: 'hashed',
        roles: [RolesEnum.ADMINISTRADOR],
      });

      await service.createFirst({
        body: { username: 'admin', name: 'Admin', password: 'secret' },
      });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: 'admin',
          name: 'Admin',
          password: 'hashed',
          roles: [RolesEnum.ADMINISTRADOR],
          status: true,
        },
      });
    });

    it('recusa criar outro administrador inicial', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await expect(
        service.createFirst({
          body: { username: 'admin2', name: 'Admin 2', password: 'secret' },
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('verifica username, armazena hash e aplica os valores do usuário', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      vi.spyOn(PasswordService, 'hash').mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue({
        ...userBody,
        password: 'hashed',
      });

      await service.create({ body: userBody });

      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          username: { equals: 'bruno', mode: 'insensitive' },
          NOT: { id: undefined },
        },
      });
      expect(PasswordService.hash).toHaveBeenCalledWith({
        password: 'secret',
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: 'bruno',
          name: 'Bruno Dias',
          password: 'hashed',
          roles: [RolesEnum.OPERADOR],
          status: true,
        },
      });
    });

    it('usa lista vazia quando perfis não são informados', async () => {
      const bodyWithoutRoles = { ...userBody, roles: undefined };
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.create.mockResolvedValue({
        ...bodyWithoutRoles,
        roles: [],
        password: 'hashed',
      });

      await service.create({ body: bodyWithoutRoles });

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ roles: [] }),
      });
    });

    it('recusa username duplicado sem gerar hash', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await expect(service.create({ body: userBody })).rejects.toThrow(
        ConflictException,
      );
      expect(hashPassword).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('consultas e alterações', () => {
    it('lista usuários sem expor hashes de senha', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 20,
          username: 'bruno',
          name: 'Bruno Dias',
          password: 'stored-hash',
          roles: [RolesEnum.OPERADOR],
        },
      ]);

      const users = await service.findAll();

      expect(users).toHaveLength(1);
      expect(users[0]).toHaveProperty('id', 20);
      expect(JSON.stringify(users[0])).not.toContain('stored-hash');
    });

    it('devolve 404 ao consultar usuário inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne({ id: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('atualiza usuário existente com senha protegida', async () => {
      prismaMock.user.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 20 });
      hashPassword.mockResolvedValue('updated-hash');
      prismaMock.user.update.mockResolvedValue({
        id: 20,
        ...userBody,
        password: 'updated-hash',
      });

      await service.update({ id: 20, body: userBody });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: {
          username: 'bruno',
          name: 'Bruno Dias',
          password: 'updated-hash',
          roles: [RolesEnum.OPERADOR],
          status: true,
        },
      });
    });

    it('usa lista vazia quando atualização não informa perfis', async () => {
      const bodyWithoutRoles = { ...userBody, roles: undefined };
      prismaMock.user.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 20 });
      prismaMock.user.update.mockResolvedValue({
        id: 20,
        ...bodyWithoutRoles,
        password: 'updated-hash',
      });

      await service.update({ id: 20, body: bodyWithoutRoles });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: expect.objectContaining({ roles: [] }),
      });
    });

    it('devolve 404 ao atualizar usuário inexistente sem gerar hash', async () => {
      prismaMock.user.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.update({ id: 20, body: userBody })).rejects.toThrow(
        NotFoundException,
      );
      expect(hashPassword).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('impede desativar o último administrador', async () => {
      prismaMock.user.count.mockResolvedValue(0);

      await expect(service.remove({ id: 1 })).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('desativa usuário sem remover o registro', async () => {
      prismaMock.user.count.mockResolvedValue(1);
      prismaMock.user.findUnique.mockResolvedValue({ id: 20 });

      await expect(service.remove({ id: 20 })).resolves.toEqual({ id: 20 });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: { status: false },
      });
    });
  });
});
