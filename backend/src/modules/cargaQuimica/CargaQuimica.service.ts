import { Injectable } from '@nestjs/common';
import { CreateOrUpdateCargaQuimicaDto } from './dtos/CargaQuimica.request.dtos.js';
import { CargaQuimicaResponseDto } from './dtos/CargaQuimica.response.dtos.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CargaQuimicaService {
  async create({
    body,
  }: {
    body: CreateOrUpdateCargaQuimicaDto;
  }): Promise<CargaQuimicaResponseDto> {
    return plainToInstance(CargaQuimicaResponseDto, body);
  }

  async findAll(): Promise<CargaQuimicaResponseDto[]> {
    const examples = [
      { id: 1, name: 'carga 1' },
      { id: 2, name: 'carga 2' },
    ];
    return plainToInstance(CargaQuimicaResponseDto, examples);
  }

  async findOne({ id }: { id: number }): Promise<CargaQuimicaResponseDto> {
    const example = { id, name: 'carga 1' };
    return plainToInstance(CargaQuimicaResponseDto, example);
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateCargaQuimicaDto;
  }): Promise<CargaQuimicaResponseDto> {
    return plainToInstance(CargaQuimicaResponseDto, { id, body });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    return { id };
  }
}
