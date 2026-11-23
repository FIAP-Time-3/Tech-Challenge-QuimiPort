import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  CreateOperadorDto,
  ListUserQueryDto,
  UpdateOperadorDto,
} from '../../dtos/user.request.dtos.js';
import { PaginatedResponseDto } from '../../../../../paginated-sort/pagination/paginated.response.dtos.js';

@ApiTags('Usuários')
@Controller('operadores')
@AllowedRoles([RolesEnum.ADMINISTRADOR])
export class OperadoresController {
  constructor(private readonly service: UserService) {}

  @Post()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Cadastrar Operador' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 409)
  async create(@Body() body: CreateOperadorDto): Promise<UserResponseDto> {
    return await this.service.create({
      body: {
        ...body,
        role: RolesEnum.OPERADOR,
      },
    });
  }

  @Get()
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiPaginatedOkResponse(UserResponseDto)
  async findAll(
    @Query() query: ListUserQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return await this.service.findAll({
      paginatedSort: query,
      email: query.email,
      roleFilter: RolesEnum.OPERADOR,
    });
  }

  @Put(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Editar operador',
    description:
      'Nome, e-mail e status são obrigatórios. O status deve ser um booleano.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateOperadorDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({
      id,
      body: { ...body, role: RolesEnum.OPERADOR },
      roleFilter: RolesEnum.OPERADOR,
    });
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
    return await this.service.remove({
      id,
      roleFilter: RolesEnum.OPERADOR,
    });
  }
}
