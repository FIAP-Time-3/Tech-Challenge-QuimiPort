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
import { AllowedRoles } from '../../../../infra/security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { CreateOrUpdateCargaQuimicaDto } from '../dtos/CargaQuimica.request.dtos.js';
import { CargaQuimicaResponseDto } from '../dtos/CargaQuimica.response.dtos.js';

@Controller('carga-quimica')
export class CargaQuimicaController {
  constructor(private readonly service: CargaQuimicaService) {}

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.GESTOR, RolesEnum.OPERADOR])
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

  @ApiParam({ name: 'id', example: 1, type: Number })
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.findOne({ id });
  }

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.GESTOR, RolesEnum.OPERADOR])
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateCargaQuimicaDto,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.update({ id, body });
  }

  @AllowedRoles([RolesEnum.ADMINISTRADOR, RolesEnum.GESTOR])
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Delete(':id')
  async remove(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<{ id: number }> {
    return await this.service.remove({ id });
  }
}