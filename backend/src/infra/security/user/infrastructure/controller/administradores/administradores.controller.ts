import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RolesEnum } from '../../../../enums/roles.enum.js';
import { AllowedRoles } from '../../../../decorators/allowed-roles.decorator.js';
import { UserService } from '../../../application/user.service.js';
import {
  ApiAuthenticated,
  ApiErrors,
  ApiPaginatedOkResponse,
  IdResponseDto,
} from '../../../../../swagger/contracts.js';
import { UserResponseDto } from '../../dtos/user.response.dtos.js';
import {
  CreateUserRequestDto,
  ListUserQueryDto,
  UpdateUserRequestDto,
  UserPasswordResetDto,
} from '../../dtos/user.request.dtos.js';
import { PaginatedResponseDto } from '../../../../../paginated-sort/pagination/paginated.response.dtos.js';

@ApiTags('Usuários')
@Controller('administradores')
@AllowedRoles([RolesEnum.ADMINISTRADOR])
export class AdministradoresController {
  private readonly role = RolesEnum.ADMINISTRADOR;

  constructor(private readonly service: UserService) {}

  @Post()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Cadastrar Administrador' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 409)
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return await this.service.create({
      body: {
        ...body,
        role: this.role,
      },
    });
  }

  @Get()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Listar Administradores' })
  @ApiPaginatedOkResponse(UserResponseDto)
  async findAll(
    @Query() query: ListUserQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return await this.service.findAll({
      paginatedSort: query,
      email: query.email,
      roleFilter: this.role,
    });
  }

  @Get(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({ summary: 'Consultar usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404)
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id, roleFilter: this.role });
  }

  @Put(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Editar Administrador',
    description:
      'Nome, e-mail e status são obrigatórios. O status deve ser um booleano.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({
      id,
      body: { ...body, role: this.role },
      roleFilter: this.role,
    });
  }

  @Delete(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Inativar Administrador',
    description:
      'Exclusão lógica; preserva o registro. Possui regra para manter sempre ao menos 1 ADMINISTRADOR ativo',
  })
  @ApiOkResponse({ type: IdResponseDto })
  @ApiErrors(400, 404)
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({
      id,
      roleFilter: this.role,
    });
  }

  @Patch('password/:id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Reset de senha por ID',
    description: '',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async resetPassword(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UserPasswordResetDto,
  ): Promise<UserResponseDto> {
    return await this.service.resetPassword({
      id,
      body,
      roleFilter: this.role,
    });
  }
}
