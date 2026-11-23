import {
  ApiAuthenticated,
  ApiErrors,
  ApiPaginatedOkResponse,
  IdResponseDto,
} from '../../../../swagger/contracts.js';
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
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserService } from '../../application/user.service.js';
import {
  CreateUserDto,
  UpdateUserDto,
  UserPasswordResetDto,
} from '../dtos/user.request.dtos.js';
import { UserResponseDto } from '../dtos/user.response.dtos.js';
import { AllowedRoles } from '../../../decorators/allowed-roles.decorator.js';
import { RolesEnum } from '../../../enums/roles.enum.js';
import { PaginatedSortQueryDto } from '../../../../paginated-sort/paginated-sort.query.dtos.js';
import { PaginatedResponseDto } from '../../../../paginated-sort/pagination/paginated.response.dtos.js';

@ApiTags('Usuários')
@Controller('users')
@AllowedRoles([RolesEnum.ADMINISTRADOR])
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Cadastrar usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 409)
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiPaginatedOkResponse(UserResponseDto)
  async findAll(
    @Query() paginatedSort: PaginatedSortQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return await this.service.findAll({ paginatedSort });
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
    return await this.service.findOne({ id });
  }

  @Put(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Editar usuário sem alterar senha',
    description:
      'Nome, e-mail e perfil obrigatórios. Password é rejeitado. Status omitido é preservado. A proteção atual pode impedir edição do único administrador ativo.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({ id, body });
  }

  @Patch('password/:id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Reset de senha por ID',
    description: 'Acessível somente para ADMINISTRADORES',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async resetPassword(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UserPasswordResetDto,
  ): Promise<UserResponseDto> {
    return await this.service.resetPassword({ id, body });
  }

  @Delete(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Inativar usuário',
    description:
      'Exclusão lógica; preserva o registro. A proteção atual exige outro administrador ativo.',
  })
  @ApiOkResponse({ type: IdResponseDto })
  @ApiErrors(400, 404)
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
