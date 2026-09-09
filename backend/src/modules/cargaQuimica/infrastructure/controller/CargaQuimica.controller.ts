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
import { ApiParam } from '@nestjs/swagger';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { CreateOrUpdateCargaQuimicaDto } from '../dtos/CargaQuimica.request.dtos.js';
import { CargaQuimicaResponseDto } from '../dtos/CargaQuimica.response.dtos.js';

@Controller('carga-quimica')
export class CargaQuimicaController {
  constructor(private readonly service: CargaQuimicaService) {}

  @Post()
  async create(
    @Body() body: CreateOrUpdateCargaQuimicaDto,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.create({ body });
  }

  @Get()
  async findAll(): Promise<CargaQuimicaResponseDto[]> {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.findOne({ id });
  }

  @Put(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateCargaQuimicaDto,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.update({ id, body });
  }

  @Delete(':id')
  @ApiParam({ name: 'id', example: 1, type: Number })
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}
