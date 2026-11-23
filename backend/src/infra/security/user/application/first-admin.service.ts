import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import type { UserResponseDto } from '../infrastructure/dtos/user.response.dtos.js';
import { withAdminLock } from './admin-lock.js';
import type { CreateFirstAdminInput } from './user.inputs.js';
import { UserService } from './user.service.js';

@Injectable()
export class FirstAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UserService,
  ) {}

  async createFirst({
    body,
  }: {
    body: CreateFirstAdminInput;
  }): Promise<UserResponseDto> {
    return withAdminLock(this.prisma, async (transaction) => {
      const countAdmin = await transaction.user.count({
        where: { role: RolesEnum.ADMINISTRADOR, status: true },
      });
      if (countAdmin > 0) {
        throw new ForbiddenException(
          'O administrador inicial já foi criado. Faça login.',
        );
      }
      return await this.users.create(
        {
          body: { ...body, role: RolesEnum.ADMINISTRADOR, status: true },
        },
        transaction,
      );
    });
  }
}
