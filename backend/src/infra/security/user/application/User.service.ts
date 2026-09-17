import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateOrUpdateUserDto } from '../infrastructure/dtos/User.request.dtos.js';
import { UserResponseDto } from '../infrastructure/dtos/User.response.dtos.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import { PasswordService } from '../../password/password.service.js';

export const mockedUsers = [
  {
    id: 1,
    name: 'mock ADMINISTRADOR Name',
    username: 'mockADMINISTRADOR',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.ADMINISTRADOR],
  },
  {
    id: 2,
    username: 'mock GESTOR Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.GESTOR],
  },
  {
    id: 3,
    username: 'mock OPERADOR Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.OPERADOR],
  },
  {
    id: 4,
    username: 'mock TECNICO Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.TECNICO],
  },
  {
    id: 5,
    username: 'mock DOCUMENTACAO Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.DOCUMENTACAO],
  },
  {
    id: 6,
    username: 'mock QUALIDADE Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.QUALIDADE],
  },
  {
    id: 7,
    username: 'mock INSPETOR Name',
    password: await PasswordService.hash({ password: 'mockedPass' }),
    roles: [RolesEnum.INSPETOR],
  },
];

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
  }: {
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, body);
  }

  async findAll(): Promise<UserResponseDto[]> {
    return plainToInstance(UserResponseDto, mockedUsers);
  }

  async findOne({ id }: { id: number }): Promise<UserResponseDto> {
    return plainToInstance(
      UserResponseDto,
      mockedUsers.find((user) => user.id === id),
    );
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
    return plainToInstance(UserResponseDto, { id, body });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    return { id };
  }
}
