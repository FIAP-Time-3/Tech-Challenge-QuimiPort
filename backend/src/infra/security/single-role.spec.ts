import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CargaQuimicaService } from '../../modules/carga-quimica/application/carga-quimica.service.js';
import { StatusCargaEnum } from '../../modules/carga-quimica/domain/value-objects/status-carga.enum.js';
import { PrismaService } from '../database/prisma.service.js';
import { AllowedRoles } from './decorators/allowed-roles.decorator.js';
import { RolesEnum } from './enums/roles.enum.js';
import { RolesGuard } from './guards/roles.guard.js';
import { LoginService } from './login/application/login.service.js';
import { UserService } from './user/application/user.service.js';
import { CreateUserDto } from './user/infrastructure/dtos/user.request.dtos.js';

const userInput = {
  name: 'Usuário de teste',
  email: 'usuario@example.com',
  password: 'secret',
};

describe('Contrato de perfil único', () => {
  it.each(Object.values(RolesEnum))(
    'aceita role escalar %s na criação',
    async (role) => {
      const dto = plainToInstance(CreateUserDto, { ...userInput, role });

      await expect(validate(dto)).resolves.toEqual([]);
    },
  );

  it.each([
    { description: 'ausente', role: undefined },
    { description: 'nulo', role: null },
    { description: 'desconhecido', role: 'TECNICO' },
    { description: 'lista com um valor', role: [RolesEnum.OPERADOR] },
    {
      description: 'lista com dois valores',
      role: [RolesEnum.OPERADOR, RolesEnum.DESPACHANTE],
    },
  ])('recusa role $description na criação', async ({ role }) => {
    const dto = plainToInstance(CreateUserDto, { ...userInput, role });

    await expect(validate(dto)).resolves.toContainEqual(
      expect.objectContaining({ property: 'role' }),
    );
  });

  it.each([
    { role: RolesEnum.ADMINISTRADOR, allowed: true },
    { role: RolesEnum.OPERADOR, allowed: true },
    { role: RolesEnum.DESPACHANTE, allowed: false },
    { role: undefined, allowed: false },
  ])('decide o acesso protegido com role $role', ({ role, allowed }) => {
    @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR])
    class ProtectedController {}

    const context = {
      getClass: () => ProtectedController,
      getHandler: () => () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }),
    } as unknown as ExecutionContext;

    expect(new RolesGuard(new Reflector()).canActivate(context)).toBe(allowed);
  });

  it('consulta administradores ativos pelo campo escalar no setup', async () => {
    const count = vi.fn().mockResolvedValue(1);
    const prisma = { user: { count } } as unknown as PrismaService;
    const service = new LoginService(prisma, new JwtService());

    await expect(service.getSetup()).resolves.toEqual({ requiresSetup: false });
    expect(count).toHaveBeenCalledWith({
      where: { role: RolesEnum.ADMINISTRADOR, status: true },
    });
  });

  it('serializa o usuário com role escalar', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      ...userInput,
      id: 1,
      role: RolesEnum.DESPACHANTE,
      status: true,
    });
    const prisma = { user: { findUnique } } as unknown as PrismaService;
    const response = instanceToPlain(
      await new UserService(prisma).findOne({ id: 1 }),
    );

    expect(response).toMatchObject({ role: RolesEnum.DESPACHANTE });
    expect(Object.keys(response)).not.toContain('roles');
    expect(Object.keys(response)).not.toContain('password');
  });

  it('nega transição de carga ao despachante autenticado com role escalar', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 1,
      statusCarga: StatusCargaEnum.CADASTRADA,
    });
    const prisma = {
      cargaQuimicas: { findUnique },
    } as unknown as PrismaService;
    const service = new CargaQuimicaService(prisma);
    const request = {
      id: 1,
      statusDestino: StatusCargaEnum.EM_PREPARACAO,
      usuario: { id: 2, role: RolesEnum.DESPACHANTE },
    };

    await expect(service.transicionar(request)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
