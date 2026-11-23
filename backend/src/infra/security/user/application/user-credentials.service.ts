import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import type { RolesEnum } from '../../enums/roles.enum.js';
import { PasswordService } from '../../password/password.service.js';
import {
  toUserResponse,
  type UserResponseDto,
} from '../infrastructure/dtos/user.response.dtos.js';
import type { ChangePasswordInput, ResetPasswordInput } from './user.inputs.js';

@Injectable()
export class UserCredentialsService {
  constructor(private readonly prisma: PrismaService) {}

  async resetPassword({
    id,
    body,
    roleFilter = undefined,
  }: {
    id: number;
    body: ResetPasswordInput;
    roleFilter?: RolesEnum;
  }): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: roleFilter ?? undefined },
    });

    if (!user) {
      throw new NotFoundException('Usuário Invalido');
    }

    const hashedPassword = await PasswordService.hash({
      password: body.newPassword,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return toUserResponse(updatedUser);
  }

  async changePassword({
    id,
    body,
  }: {
    id: number;
    body: ChangePasswordInput;
  }): Promise<UserResponseDto> {
    const { currentPassword, newPassword, newPasswordConfirm } = body;
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (!user) {
      throw new BadRequestException('Usuário Invalido');
    }

    const isValidPassword = await PasswordService.compare({
      hash: user.password,
      password: currentPassword,
    });

    if (!isValidPassword) {
      throw new BadRequestException('Senha incorreta');
    }

    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException(
        'Senha e Confirmação de senha devem ser iguais',
      );
    }
    const hashedPassword = await PasswordService.hash({
      password: body.newPassword,
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return toUserResponse(updatedUser);
  }
}
