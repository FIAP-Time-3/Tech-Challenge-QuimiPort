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
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';
import { CreateOrUpdateProdutoQuimicoDto } from './dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from './dtos/ProdutoQuimico.response.dtos.js';
import { ApiParam } from '@nestjs/swagger';

@Controller('produto-quimico')
export class ProdutoQuimicoController {
  constructor(private readonly service: ProdutoQuimicoService) {}

  @Post()
  async create(
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  async findAll(): Promise<ProdutoQuimicoResponseDto[]> {
    return await this.service.findAll();
  }

  @ApiParam({ name: 'id', example: 1, type: Number })
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.findOne({ id });
  }

  @ApiParam({ name: 'id', example: 1, type: Number })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.update({ id, body });
  }

  @ApiParam({ name: 'id', example: 1, type: Number })
  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
