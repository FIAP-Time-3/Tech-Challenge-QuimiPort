import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { CreateOrUpdateProdutoQuimicoDto } from '../infrastructure/dtos/ProdutoQuimico.request.dtos.js';
import { ProdutoQuimicoResponseDto } from '../infrastructure/dtos/ProdutoQuimico.response.dtos.js';

@Injectable()
export class ProdutoQuimicoService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
  }: {
    body: CreateOrUpdateProdutoQuimicoDto;
  }): Promise<ProdutoQuimicoResponseDto> {
    await this.checkDuplicated({ body });
    const newProduct = await this.prisma.produtosQuimicos.create({
      data: body,
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
    await this.checkDuplicated({ body, id });
    const product = await this.prisma.produtosQuimicos.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('Produto quimico não encontrado');
    }

    await this.prisma.produtosQuimicos.update({
      where: { id },
      data: body,
    });
    return await this.findOne({ id });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    await this.findOne({ id });

    const cargasAssociadas = await this.prisma.cargaQuimicas.count({
      where: {
        produtoQuimicoId: id,
      },
    });

    if (cargasAssociadas > 0) {
      throw new ConflictException(
        'O produto químico não pode ser excluído pois está associado a uma ou mais cargas.',
      );
    }

    return this.prisma.produtosQuimicos.delete({
      where: { id },
    });
  }

  private async checkDuplicated({
    id,
    body,
  }: {
    id?: number;
    body: CreateOrUpdateProdutoQuimicoDto;
  }) {
    const duplicated = await this.prisma.produtosQuimicos.count({
      where: {
        nome: { equals: body.nome, mode: 'insensitive' },
        NOT: { id: id ?? undefined },
      },
    });
    if (duplicated > 0) {
      throw new ConflictException('Produto Quimico Duplicado');
    }
  }
}
