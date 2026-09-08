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

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.findOne({ id });
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateProdutoQuimicoDto,
  ): Promise<ProdutoQuimicoResponseDto> {
    return await this.service.update({ id, body });
  }

  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
