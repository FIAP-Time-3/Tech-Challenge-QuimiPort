import {
  ApiAuthenticated,
  ApiErrors,
  IdResponseDto,
} from '../../../../swagger/contracts.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiParam,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserService } from '../../application/User.service.js';
import {
  CreateFirstUserDto,
  CreateUserDto,
  UpdateUserDto,
} from '../dtos/User.request.dtos.js';
import { UserResponseDto } from '../dtos/User.response.dtos.js';
import { AllowedRoles } from '../../../decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../enums/roles.enum.js';
import { SetPublic } from '../../../decorators/setPublic.decorator.js';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({
    summary: 'Criar o administrador inicial',
    security: [],
    description:
      'Cadastro público permitido somente enquanto não existir administrador ativo.',
  })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 403, 409)
  @Post('first_access')
  @SetPublic()
  async createFirstAdmin(
    @Body() body: CreateFirstUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.createFirst({
      body,
    });
  }

  @Post()
  @ApiAuthenticated()
  @ApiErrors(403)
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiOperation({ summary: 'Cadastrar usuário' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 409)
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  @ApiAuthenticated()
  @ApiErrors(403)
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiOkResponse({ type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
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
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Editar usuário sem alterar senha',
    description:
      'Nome/email obrigatórios. Password é rejeitado. Status omitido é preservado; roles omitido vira []. A proteção atual pode impedir edição do único administrador ativo.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.update({ id, body });
  }

  @Delete(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @AllowedRoles([RolesEnum.ADMINISTRADOR])
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
