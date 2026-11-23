import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  toUserResponse,
  type UserResponseDto,
} from '../infrastructure/dtos/user.response.dtos.js';
import { withAdminLock } from './admin-lock.js';
import type { CreateUserInput, UpdateUserInput } from './user.inputs.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import { PaginatedSortQueryDto } from '../../../paginated-sort/paginated-sort.query.dtos.js';
import { adjustPaginationAndSortOptions } from '../../../paginated-sort/paginated-sort.utils.js';
import { Prisma } from '../../../database/generated/prisma/client.js';
import { PaginatedResponseDto } from '../../../paginated-sort/pagination/paginated.response.dtos.js';

@Injectable()
export class UserService {
  public readonly fields = Prisma.UserScalarFieldEnum;

  constructor(private readonly prisma: PrismaService) {}

  async create(
    {
      body,
    }: {
      body: CreateUserInput;
    },
    database: Pick<PrismaService, 'user'> = this.prisma,
  ): Promise<UserResponseDto> {
    await this.checkDuplicated({ body }, database);
    const hashedPassword = await PasswordService.hash({
      password: body.password,
    });

    const user = await database.user.create({
      data: {
        email: body.email,
        name: this.normalizeName(body.name),
        password: hashedPassword,
        role: body.role,
        status: body.status,
      },
    });

    return toUserResponse(user);
  }

  async findAll({
    paginatedSort,
    email = '',
    roleFilter = undefined,
  }: {
    paginatedSort: PaginatedSortQueryDto;
    email?: string;
    roleFilter?: RolesEnum;
  }): Promise<PaginatedResponseDto<UserResponseDto>> {
    const filters = {
      role: roleFilter ?? undefined,
      email: {
        contains: email,
      },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        ...adjustPaginationAndSortOptions({
          paginatedSort,
          fields: this.fields,
        }),
      }),
      this.prisma.user.count({
        where: filters,
      }),
    ]);

    return new PaginatedResponseDto(
      users.map((user) => toUserResponse(user)),
      paginatedSort.page,
      paginatedSort.limit,
      total,
    );
  }

  async findOne(
    { id, roleFilter = undefined }: { id: number; roleFilter?: RolesEnum },
    database: Pick<PrismaService, 'user'> = this.prisma,
  ): Promise<UserResponseDto> {
    const user = await database.user.findUnique({
      where: { id, role: roleFilter ?? undefined },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return toUserResponse(user);
  }

  async update({
    id,
    body,
    roleFilter = undefined,
  }: {
    id: number;
    body: UpdateUserInput;
    roleFilter?: RolesEnum;
  }): Promise<UserResponseDto> {
    return withAdminLock(this.prisma, async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id, role: roleFilter ?? undefined },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (
        user.role === RolesEnum.ADMINISTRADOR &&
        user.status &&
        (body.role !== RolesEnum.ADMINISTRADOR || body.status === false)
      ) {
        await this.validateUniqueAdmin({ id }, transaction);
      }

      await this.checkDuplicated({ body, id }, transaction);

      const updatedUser = await transaction.user.update({
        where: { id },
        data: {
          email: body.email,
          name: this.normalizeName(body.name),
          role: body.role,
          status: body.status,
        },
      });

      return toUserResponse(updatedUser);
    });
  }

  async remove({
    id,
    roleFilter = undefined,
  }: {
    id: number;
    roleFilter?: RolesEnum;
  }): Promise<{ id: number }> {
    return withAdminLock(this.prisma, async (transaction) => {
      const user = await this.findOne({ id, roleFilter }, transaction);

      if (user.role === RolesEnum.ADMINISTRADOR && user.status) {
        await this.validateUniqueAdmin({ id }, transaction);
      }

      await transaction.user.update({
        where: { id },
        data: { status: false },
      });

      return { id };
    });
  }

  private async checkDuplicated(
    {
      id,
      body,
    }: {
      id?: number;
      body: Pick<UpdateUserInput, 'email'>;
    },
    database: Pick<PrismaService, 'user'> = this.prisma,
  ) {
    const duplicated = await database.user.count({
      where: {
        email: { equals: body.email, mode: 'insensitive' },
        NOT: { id: id ?? undefined },
      },
    });
    if (duplicated > 0) {
      throw new ConflictException('O email já está em uso');
    }
  }

  private async validateUniqueAdmin(
    { id }: { id: number },
    database: Pick<PrismaService, 'user'>,
  ) {
    const countAdmin = await database.user.count({
      where: {
        role: RolesEnum.ADMINISTRADOR,
        status: true,
        id: { not: id },
      },
    });

    if (countAdmin === 0) {
      throw new BadRequestException('Nenhum ADMINISTRADOR no sistema');
    }
  }

  private normalizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/gu, ' ')
      .toLocaleLowerCase('pt-BR')
      .replace(
        /(^|[\s’'-])(\p{L})/gu,
        (_, separator: string, letter: string) =>
          separator + letter.toLocaleUpperCase('pt-BR'),
      );
  }
}
