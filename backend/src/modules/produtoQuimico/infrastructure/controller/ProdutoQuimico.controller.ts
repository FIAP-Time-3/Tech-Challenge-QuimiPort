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
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedRoles } from '../../../../infra/security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { ProdutoQuimicoService } from '../../application/ProdutoQuimico.service.js';
import { CreateOrUpdateProdutoQuimicoDto } from '../dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from '../dtos/ProdutoQuimico.response.dtos.js';

@AllowedRoles([
  RolesEnum.ADMINISTRADOR,
  RolesEnum.GESTOR,
  RolesEnum.OPERADOR,
  RolesEnum.TECNICO,
])
@ApiTags('Produtos químicos')
@Controller('produtos-quimicos')
export class ProdutoQuimicoController {
  constructor(private readonly service: ProdutoQuimicoService) {}

  @ApiOperation({
    summary: 'Cadastrar produto químico',
    description:
      'Exige nome único e classe de risco de 1 a 9. Nome duplicado devolve 409.',
  })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @Post()
  async create(
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.create({ body });
  }

  @ApiOperation({ summary: 'Listar produtos químicos' })
  @ApiOkResponse({ type: [ProdutoQuimicoResponseDto] })
  @Get()
  async findAll(): Promise<ProdutoQuimicoResponseDto[]> {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: 'Buscar produto químico por id' })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.findOne({ id });
  }

  @ApiOperation({ summary: 'Atualizar produto químico' })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.update({ id, body });
  }

  @ApiOperation({
    summary: 'Inativar produto químico',
    description:
      'Inativação lógica (status = false). O produto deixa de poder ser usado em novas cargas, mas as cargas existentes não são afetadas. Chamar de novo em um produto já inativo não gera erro.',
  })
  @ApiOkResponse({ type: ProdutoQuimicoResponseDto })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Patch(':id/inativar')
  async inativar(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.inativar({ id });
  }

  @ApiOperation({
    summary: 'Excluir produto químico',
    description:
      'Só é permitido para produtos sem cargas associadas; caso contrário devolve 409.',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
