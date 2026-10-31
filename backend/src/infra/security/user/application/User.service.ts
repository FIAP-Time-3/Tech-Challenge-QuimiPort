import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  CreateFirstUserDto,
  CreateOrUpdateUserDto,
} from '../infrastructure/dtos/User.request.dtos.js';
import { UserResponseDto } from '../infrastructure/dtos/User.response.dtos.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createFirst({
    body,
  }: {
    body: CreateFirstUserDto;
  }): Promise<UserResponseDto> {
    const countAdmin = await this.prisma.user.count({
      where: {
        roles: { has: RolesEnum.ADMINISTRADOR },
        status: true,
      },
    });

    if (countAdmin > 0) {
      throw new ForbiddenException();
    }

    return await this.create({
      body: { ...body, roles: [RolesEnum.ADMINISTRADOR], status: true },
    });
  }

  async create({
    body,
  }: {
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
    await this.checkDuplicated({ body });
    const hashedPassword = await PasswordService.hash({
      password: body.password,
    });

    const user = await this.prisma.user.create({
      data: {
        username: body.username,
        name: body.name,
        password: hashedPassword,
        roles: body.roles ?? [],
        status: body.status,
      },
    });

    return this.toResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();

    return users.map((user) => this.toResponse(user));
  }

  async findOne({ id }: { id: number }): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toResponse(user);
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
    await this.validateUniqueAdmin({ id });

    await this.checkDuplicated({ body, id });
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const hashedPassword = await PasswordService.hash({
      password: body.password,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        username: body.username,
        name: body.name,
        password: hashedPassword,
        roles: body.roles ?? [],
        status: body.status,
      },
    });

    return this.toResponse(updatedUser);
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    await this.validateUniqueAdmin({ id });

    await this.findOne({ id });

    await this.prisma.user.update({
      where: { id },
      data: { status: false },
    });

    return { id };
  }

  private async checkDuplicated({
    id,
    body,
  }: {
    id?: number;
    body: CreateOrUpdateUserDto;
  }) {
    const duplicated = await this.prisma.user.count({
      where: {
        username: { equals: body.username, mode: 'insensitive' },
        NOT: { id: id ?? undefined },
      },
    });
    if (duplicated > 0) {
      throw new ConflictException('O username ja esta em uso');
    }
  }

  private async validateUniqueAdmin({ id }: { id: number }) {
    const countAdmin = await this.prisma.user.count({
      where: {
        roles: { has: RolesEnum.ADMINISTRADOR },
        status: true,
        id: { not: id },
      },
    });

    if (countAdmin === 0) {
      throw new BadRequestException('Nenhum ADMINISTRADOR no sistema');
    }
  }

  private toResponse<T extends { password: string }>(user: T): UserResponseDto {
    const safeUser = { ...user };
    Reflect.deleteProperty(safeUser, 'password');
    return plainToInstance(UserResponseDto, safeUser);
  }
}
