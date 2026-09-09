import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrUpdateProdutoQuimicoDto } from './dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from './dtos/ProdutoQuimico.response.dtos.js';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ProdutoQuimicoService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
  }: {
    body: CreateOrUpdateProdutoQuimicoDto;
  }): Promise<ProdutoQuimicoResponseDto> {
    const newProduct = await this.prisma.produtosQuimicos.create({
      data: { produto: body.name },
    });

    return await this.findOne({ id: newProduct.id });
  }

  async findAll(): Promise<ProdutoQuimicoResponseDto[]> {
    const products = await this.prisma.produtosQuimicos.findMany();
    return plainToInstance(ProdutoQuimicoResponseDto, products);
  }

  async findOne({ id }: { id: number }): Promise<ProdutoQuimicoResponseDto> {
    const product = await this.prisma.produtosQuimicos.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Produto quimico não encontrado');
    }

    return plainToInstance(ProdutoQuimicoResponseDto, product);
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateProdutoQuimicoDto;
  }): Promise<ProdutoQuimicoResponseDto> {
    const product = await this.prisma.produtosQuimicos.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Produto quimico não encontrado');
    }

    this.prisma.produtosQuimicos.update({
      where: { id },
      data: { produto: body.name },
    });
    return await this.findOne({ id });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    await this.findOne({ id });

    return this.prisma.produtosQuimicos.delete({
      where: { id },
    });
  }
}
