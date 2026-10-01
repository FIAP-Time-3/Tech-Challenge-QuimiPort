import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateOrUpdateUserDto } from '../infrastructure/dtos/User.request.dtos.js';
import { UserResponseDto } from '../infrastructure/dtos/User.response.dtos.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
  }: {
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
    const hashedPassword = await PasswordService.hash({
      password: body.password,
    });

    const user = await this.prisma.user.create({
      data: {
        username: body.username,
        name: body.name,
        password: hashedPassword,
        roles: body.roles ?? [],
      },
    });

    return plainToInstance(UserResponseDto, user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();

    return plainToInstance(UserResponseDto, users);
  }

  async findOne({ id }: { id: number }): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return plainToInstance(UserResponseDto, user);
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateUserDto;
  }): Promise<UserResponseDto> {
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
      },
    });

    return plainToInstance(UserResponseDto, updatedUser);
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    await this.findOne({ id });

    await this.prisma.user.delete({
      where: { id },
    });

    return { id };
  }
}
