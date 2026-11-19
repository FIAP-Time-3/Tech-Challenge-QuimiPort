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
    $transaction: vi.fn(),
    $executeRaw: vi.fn(),
    user: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  const userBody = {
    email: 'bruno@email.com',
    name: 'Bruno Dias',
    password: 'secret',
    role: RolesEnum.OPERADOR,
    status: true,
  };
  const updateBody = {
    email: userBody.email,
    name: userBody.name,
    role: userBody.role,
    status: userBody.status,
  };
  let hashPassword: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(prismaMock),
    );
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

  it.each([
    ['  bRUNO   dIAS  ', 'Bruno Dias'],
    ['JOÃO GONÇALVES', 'João Gonçalves'],
    ["ana-mARIA d'ÁVILA", "Ana-Maria D'Ávila"],
  ])(
    'normaliza o nome ao criar, atualizar e cadastrar o administrador: %s',
    async (name, expected) => {
      const body = { ...userBody, name, email: 'LoginOriginal@email.com' };
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.create.mockResolvedValue({ ...body, password: 'hashed' });
      prismaMock.user.findUnique.mockResolvedValue({ ...body, id: 8 });
      prismaMock.user.update.mockResolvedValue({ ...body, id: 8 });
      await service.create({ body });
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          name: expected,
          email: 'LoginOriginal@email.com',
        }),
      });
      await service.createFirst({ body });
      expect(prismaMock.user.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          name: expected,
          email: 'LoginOriginal@email.com',
        }),
      });
      prismaMock.user.count.mockResolvedValueOnce(0);
      const editBody = { ...updateBody, name: body.name, email: body.email };
      await service.update({ id: 8, body: editBody });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 8 },
        data: expect.objectContaining({
          name: expected,
          email: 'LoginOriginal@email.com',
        }),
      });
    },
  );

  describe('createFirst', () => {
    it('cria o primeiro usuário como administrador ativo', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      prismaMock.user.create.mockResolvedValue({
        ...userBody,
        password: 'hashed',
        role: RolesEnum.ADMINISTRADOR,
      });

      await service.createFirst({
        body: { email: 'admin@email.com', name: 'Admin', password: 'secret' },
      });

      expect(prismaMock.$executeRaw).toHaveBeenCalledOnce();
      expect(prismaMock.user.count).toHaveBeenNthCalledWith(1, {
        where: { role: RolesEnum.ADMINISTRADOR, status: true },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'admin@email.com',
          name: 'Admin',
          password: 'hashed',
          role: RolesEnum.ADMINISTRADOR,
          status: true,
        },
      });
    });

    it('recusa criar outro administrador inicial', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await expect(
        service.createFirst({
          body: {
            email: 'admin2@email.com',
            name: 'Admin 2',
            password: 'secret',
          },
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('verifica email, armazena hash e aplica os valores do usuário', async () => {
      prismaMock.user.count.mockResolvedValue(0);
      vi.spyOn(PasswordService, 'hash').mockResolvedValue('hashed');
      prismaMock.user.create.mockResolvedValue({
        ...userBody,
        password: 'hashed',
      });

      await service.create({ body: userBody });

      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          email: { equals: 'bruno@email.com', mode: 'insensitive' },
          NOT: { id: undefined },
        },
      });
      expect(PasswordService.hash).toHaveBeenCalledWith({
        password: 'secret',
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'bruno@email.com',
          name: 'Bruno Dias',
          password: 'hashed',
          role: RolesEnum.OPERADOR,
          status: true,
        },
      });
    });

    it('recusa email duplicado sem gerar hash', async () => {
      prismaMock.user.count.mockResolvedValue(1);

      await expect(service.create({ body: userBody })).rejects.toThrow(
        ConflictException,
      );
      expect(hashPassword).not.toHaveBeenCalled();
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe('consultas e alterações', () => {
    it('pagina e ordena usuários sem expor hashes de senha', async () => {
      prismaMock.user.findMany.mockResolvedValue([
        {
          id: 20,
          email: 'bruno@email.com',
          name: 'Bruno Dias',
          password: 'stored-hash',
          role: RolesEnum.OPERADOR,
        },
      ]);

      prismaMock.user.count.mockResolvedValue(3);

      const result = await service.findAll({
        paginatedSort: { page: 2, limit: 2, column: 'name', order: 'desc' },
      });

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        skip: 2,
        take: 2,
        orderBy: { name: 'desc' },
      });
      expect(prismaMock.user.count).toHaveBeenCalledOnce();
      expect(result).toMatchObject({
        data: [{ id: 20, email: 'bruno@email.com' }],
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
      });
      expect(result.data[0]?.password).toBeUndefined();
      expect(JSON.stringify(result.data[0])).not.toContain('stored-hash');
    });

    it('devolve 404 ao consultar usuário inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne({ id: 20 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('atualiza usuário sem gerar hash nem gravar senha', async () => {
      prismaMock.user.count.mockResolvedValueOnce(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 20 });
      prismaMock.user.update.mockResolvedValue({
        id: 20,
        ...userBody,
        password: 'stored-hash',
      });

      await service.update({ id: 20, body: updateBody });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: {
          email: 'bruno@email.com',
          name: 'Bruno Dias',
          role: RolesEnum.OPERADOR,
          status: true,
        },
      });
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it('não fornece status nem senha ao Prisma quando omitidos na edição', async () => {
      prismaMock.user.count.mockResolvedValueOnce(0);
      prismaMock.user.findUnique.mockResolvedValue({ id: 20, status: false });
      prismaMock.user.update.mockResolvedValue({
        id: 20,
        email: userBody.email,
        status: false,
        password: 'hash',
      });
      await service.update({
        id: 20,
        body: {
          name: userBody.name,
          email: userBody.email,
          role: userBody.role,
        },
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: {
          name: userBody.name,
          email: userBody.email,
          role: userBody.role,
          status: undefined,
        },
      });
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      'encaminha status explícito %s sem gerar senha',
      async (status) => {
        prismaMock.user.count.mockResolvedValueOnce(0);
        prismaMock.user.findUnique.mockResolvedValue({ id: 20 });
        prismaMock.user.update.mockResolvedValue({
          id: 20,
          ...updateBody,
          status,
          password: 'hash',
        });
        await service.update({ id: 20, body: { ...updateBody, status } });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: 20 },
          data: { ...updateBody, status },
        });
        expect(hashPassword).not.toHaveBeenCalled();
      },
    );

    it('devolve 404 ao atualizar usuário inexistente sem gerar hash', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update({ id: 20, body: updateBody }),
      ).rejects.toThrow(NotFoundException);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('impede desativar o último administrador', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        role: RolesEnum.ADMINISTRADOR,
        status: true,
      });
      prismaMock.user.count.mockResolvedValue(0);

      await expect(service.remove({ id: 1 })).rejects.toMatchObject({
        name: BadRequestException.name,
        message: 'Nenhum ADMINISTRADOR no sistema',
        status: 400,
      });
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          role: RolesEnum.ADMINISTRADOR,
          status: true,
          id: { not: 1 },
        },
      });
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

  describe('proteção do último administrador ativo', () => {
    const admin = {
      id: 1,
      email: 'admin@example.com',
      name: 'Admin Original',
      role: RolesEnum.ADMINISTRADOR,
      status: true,
      password: 'stored-hash',
    };
    const changes = {
      name: 'Admin Editado',
      email: 'editado@example.com',
      role: RolesEnum.ADMINISTRADOR,
    };

    it.each([undefined, true])(
      'permite editar nome e e-mail do único administrador com status %s',
      async (status) => {
        prismaMock.user.findUnique.mockResolvedValue(admin);
        prismaMock.user.count.mockResolvedValue(0);
        prismaMock.user.update.mockResolvedValue({ ...admin, ...changes });

        const body = status === undefined ? changes : { ...changes, status };
        await expect(
          service.update({ id: admin.id, body }),
        ).resolves.toMatchObject({
          ...changes,
          status: true,
        });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: admin.id },
          data: expect.objectContaining(changes),
        });
        expect(hashPassword).not.toHaveBeenCalled();
      },
    );

    it.each([
      { role: RolesEnum.ADMINISTRADOR, status: false },
      { role: RolesEnum.OPERADOR, status: true },
      { role: RolesEnum.DESPACHANTE, status: true },
    ])('impede perder o último administrador com %o', async (transition) => {
      prismaMock.user.findUnique.mockResolvedValue(admin);
      prismaMock.user.count.mockResolvedValue(0);

      await expect(
        service.update({ id: admin.id, body: { ...changes, ...transition } }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('permite inativar administrador se houver outro ativo', async () => {
      prismaMock.user.findUnique.mockResolvedValue(admin);
      prismaMock.user.count.mockResolvedValue(1);

      await expect(service.remove({ id: admin.id })).resolves.toEqual({
        id: admin.id,
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: admin.id },
        data: { status: false },
      });
    });

    it.each([
      { role: RolesEnum.OPERADOR, status: true },
      { role: RolesEnum.DESPACHANTE, status: true },
      { role: RolesEnum.ADMINISTRADOR, status: false },
    ])(
      'permite inativar %o quando a operação não reduz o número de admins ativos',
      async (current) => {
        prismaMock.user.findUnique.mockResolvedValue({ ...admin, ...current });
        prismaMock.user.count.mockResolvedValue(0);

        await expect(service.remove({ id: admin.id })).resolves.toEqual({
          id: admin.id,
        });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: admin.id },
          data: { status: false },
        });
      },
    );

    it('devolve 404 ao tentar editar ou inativar um ID inexistente', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.update({ id: 404, body: changes })).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove({ id: 404 })).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
