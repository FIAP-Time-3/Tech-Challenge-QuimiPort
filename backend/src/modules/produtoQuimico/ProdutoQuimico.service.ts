import { Injectable } from '@nestjs/common';
import { CreateOrUpdateProdutoQuimicoDto } from './dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from './dtos/ProdutoQuimico.response.dtos.js';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProdutoQuimicoService {
  async create({
    body,
  }: {
    body: CreateOrUpdateProdutoQuimicoDto;
  }): Promise<ProdutoQuimicoResponseDto> {
    return plainToInstance(ProdutoQuimicoResponseDto, body);
  }

  async findAll(): Promise<ProdutoQuimicoResponseDto[]> {
    const examples = [
      { id: 1, name: 'carga 1' },
      { id: 2, name: 'carga 2' },
    ];
    return plainToInstance(ProdutoQuimicoResponseDto, examples);
  }

  async findOne({ id }: { id: number }): Promise<ProdutoQuimicoResponseDto> {
    const example = { id, name: 'carga 1' };
    return plainToInstance(ProdutoQuimicoResponseDto, example);
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateProdutoQuimicoDto;
  }): Promise<ProdutoQuimicoResponseDto> {
    return plainToInstance(ProdutoQuimicoResponseDto, { id, body });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    return { id };
  }
}
