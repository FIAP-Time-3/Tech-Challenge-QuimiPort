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
} from '../infrastructure/dtos/User.request.dtos.js';
import { UserResponseDto } from '../infrastructure/dtos/User.response.dtos.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { PasswordService } from '../../password/password.service.js';
import { RolesEnum } from '../../enums/roles.enum.js';
import { PaginatedSortQueryDto } from '../../../paginatedSort/paginated-sort.query.dtos.js';
import { adjustPaginationAndSortOptions } from '../../../paginatedSort/paginated-sort.utils.js';
import { Prisma } from '../../../database/generated/prisma/client.js';
import { PaginatedResponseDto } from '../../../paginatedSort/pagination/paginated.response.dtos.js';

@Injectable()
export class UserService {
  public readonly fields = Prisma.UserScalarFieldEnum;

  constructor(private readonly prisma: PrismaService) {}

  async createFirst({
    body,
  }: {
    body: CreateFirstUserDto;
  }): Promise<UserResponseDto> {
    return await this.prisma.$transaction(async (transaction) => {
      // Serializa o primeiro cadastro entre requisições e instâncias da API.
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(714205)`;
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
  }: {
    paginatedSort: PaginatedSortQueryDto;
  }): Promise<PaginatedResponseDto<UserResponseDto>> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        ...adjustPaginationAndSortOptions({
          paginatedSort,
          fields: this.fields,
        }),
      }),
      this.prisma.user.count(),
    ]);

    return new PaginatedResponseDto(
      users.map((user) => this.toResponse(user)),
      paginatedSort.page,
      paginatedSort.limit,
      total,
    );
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
    body: UpdateUserDto;
  }): Promise<UserResponseDto> {
    await this.validateUniqueAdmin({ id });

    await this.checkDuplicated({ body, id });
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: body.email,
        name: this.normalizeName(body.name),
        role: body.role,
        status: body.status,
      },
    });

    return this.toResponse(updatedUser);
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

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    await this.validateUniqueAdmin({ id });

    await this.findOne({ id });

    await this.prisma.user.update({
      where: { id },
      data: { status: false },
    });

    return { id };
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

  private async validateUniqueAdmin({ id }: { id: number }) {
    const countAdmin = await this.prisma.user.count({
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
