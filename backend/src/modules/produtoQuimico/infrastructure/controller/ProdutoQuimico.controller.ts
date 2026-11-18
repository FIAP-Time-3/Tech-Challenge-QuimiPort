import {
  ApiAuthenticated,
  ApiErrors,
  ApiPaginatedOkResponse,
  IdResponseDto,
} from '../../../../infra/swagger/contracts.js';
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
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedRoles } from '../../../../infra/security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { ProdutoQuimicoService } from '../../application/ProdutoQuimico.service.js';
import { CreateOrUpdateProdutoQuimicoDto } from '../dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from '../dtos/ProdutoQuimico.response.dtos.js';
import { PaginatedResponseDto } from '../../../../infra/paginatedSort/pagination/paginated.response.dtos.js';
import { PaginatedSortQueryDto } from '../../../../infra/paginatedSort/paginated-sort.query.dtos.js';

@ApiAuthenticated()
@ApiErrors(403)
@ApiTags('Produtos químicos')
@Controller('produtos-quimicos')
export class ProdutoQuimicoController {
  constructor(private readonly service: ProdutoQuimicoService) {}

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR])
  @ApiOperation({
    summary: 'Cadastrar produto químico',
    description:
      'Exige nome único, numeroONU com quatro algarismos (diferente de 0000) e classe de risco de 1 a 9. Nome duplicado devolve 409.',
  })
  @ApiCreatedResponse({ type: ProdutoQuimicoResponseDto })
  @ApiErrors(400, 409)
  @Post()
  async create(
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.create({ body });
  }

  @ApiOperation({ summary: 'Listar produtos químicos' })
  @ApiPaginatedOkResponse(ProdutoQuimicoResponseDto)
  @Get()
  async findAll(
    @Query() paginatedSort: PaginatedSortQueryDto,
  ): Promise<PaginatedResponseDto<ProdutoQuimicoResponseDto>> {
    return await this.service.findAll({ paginatedSort });
  }

  @ApiOperation({ summary: 'Buscar produto químico por id' })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Get(':id')
  @ApiErrors(400, 404)
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.findOne({ id });
  }

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR])
  @ApiOperation({ summary: 'Atualizar produto químico' })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Put(':id')
  @ApiErrors(400, 404, 409)
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.update({ id, body });
  }

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR])
  @ApiOperation({
    summary: 'Inativar produto químico',
    description:
      'Inativação lógica (status = false). O produto deixa de poder ser usado em novas cargas, mas as cargas existentes não são afetadas. Chamar de novo em um produto já inativo não gera erro.',
  })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Patch(':id/inativar')
  @ApiErrors(400, 404)
  async inativar(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.inativar({ id });
  }

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR])
  @ApiOperation({
    summary: 'Excluir produto químico',
    description:
      'Só é permitido para produtos sem cargas associadas; caso contrário devolve 409.',
  })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Delete(':id')
  @ApiOkResponse({ type: IdResponseDto })
  @ApiErrors(400, 404, 409)
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
