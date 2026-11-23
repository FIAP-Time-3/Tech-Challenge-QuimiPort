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
  CreateUserDto,
  UpdateUserDto,
  UserPasswordChangeDto,
  UserPasswordResetDto,
} from '../infrastructure/dtos/user.request.dtos.js';
import { UserResponseDto } from '../infrastructure/dtos/user.response.dtos.js';
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

  async createFirst({
    body,
  }: {
    body: CreateFirstUserDto;
  }): Promise<UserResponseDto> {
    return this.withAdminLock(async (transaction) => {
      const countAdmin = await transaction.user.count({
        where: { role: RolesEnum.ADMINISTRADOR, status: true },
      });
      if (countAdmin > 0) {
        throw new ForbiddenException(
          'O administrador inicial já foi criado. Faça login.',
        );
      }
      return await this.create(
        {
          body: { ...body, role: RolesEnum.ADMINISTRADOR, status: true },
        },
        transaction,
      );
    });
  }

  async create(
    {
      body,
    }: {
      body: CreateUserDto;
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

    return this.toResponse(user);
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
      users.map((user) => this.toResponse(user)),
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

    return this.toResponse(user);
  }

  async update({
    id,
    body,
    roleFilter = undefined,
  }: {
    id: number;
    body: UpdateUserDto;
    roleFilter?: RolesEnum;
  }): Promise<UserResponseDto> {
    return this.withAdminLock(async (transaction) => {
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

      return this.toResponse(updatedUser);
    });
  }

  async resetPassword({
    id,
    body,
  }: {
    id: number;
    body: UserPasswordResetDto;
  }) {
    const user = await this.prisma.user.findFirst({ where: { id } });

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

    return this.toResponse(updatedUser);
  }

  async changePassword({
    id,
    body,
  }: {
    id: number;
    body: UserPasswordChangeDto;
  }) {
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

    return this.toResponse(updatedUser);
  }

  async remove({
    id,
    roleFilter = undefined,
  }: {
    id: number;
    roleFilter?: RolesEnum;
  }): Promise<{ id: number }> {
    return this.withAdminLock(async (transaction) => {
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
      body: CreateUserDto | UpdateUserDto;
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

  private withAdminLock<T>(
    operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(714205)`;
        return operation(transaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
    );
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

  private toResponse<T extends { password: string }>(user: T): UserResponseDto {
    const safeUser = { ...user };
    Reflect.deleteProperty(safeUser, 'password');
    return plainToInstance(UserResponseDto, safeUser);
  }
}
