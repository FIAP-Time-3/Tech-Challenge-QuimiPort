import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { ehTerminal } from '../domain/CargaQuimica.transicoes.js';
import { StatusCargaEnum } from '../domain/value-objects/StatusCarga.enum.js';
import { CreateOrUpdateCargaQuimicaDto } from '../infrastructure/dtos/CargaQuimica.request.dtos.js';
import { CargaQuimicaResponseDto } from '../infrastructure/dtos/CargaQuimica.response.dtos.js';

@Injectable()
export class CargaQuimicaService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
  }: {
    body: CreateOrUpdateCargaQuimicaDto;
  }): Promise<CargaQuimicaResponseDto> {
    const produto = await this.getProdutoAtivo(body.produtoQuimicoId);

    const carga = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cargaQuimicas.create({
        data: {
          produtoQuimicoId: produto.id,
          quantidade: body.quantidade,
          unidadeMedida: body.unidadeMedida,
          destino: body.destino,
          statusCarga: StatusCargaEnum.CADASTRADA,
          classeRiscoONU: produto.classeRisco,
        },
      });

      await tx.movimentacoes.create({
        data: {
          cargaQuimicaId: created.id,
          step: 1,
          statusAnterior: null,
          statusAtual: StatusCargaEnum.CADASTRADA,
          notes: 'Carga cadastrada',
        },
      });

      return created;
    });

    return await this.findOne({ id: carga.id });
  }

  async findAll(): Promise<CargaQuimicaResponseDto[]> {
    const cargas = await this.prisma.cargaQuimicas.findMany({
      include: { produtoQuimico: true },
      orderBy: { id: 'asc' },
    });
    return plainToInstance(CargaQuimicaResponseDto, cargas, {
      excludeExtraneousValues: true,
    });
  }

  async findOne({ id }: { id: number }): Promise<CargaQuimicaResponseDto> {
    const carga = await this.prisma.cargaQuimicas.findUnique({
      where: { id },
      include: { produtoQuimico: true },
    });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }
    return plainToInstance(CargaQuimicaResponseDto, carga, {
      excludeExtraneousValues: true,
    });
  }

  async update({
    id,
    body,
  }: {
    id: number;
    body: CreateOrUpdateCargaQuimicaDto;
  }): Promise<CargaQuimicaResponseDto> {
    const carga = await this.prisma.cargaQuimicas.findUnique({ where: { id } });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }

    const status = carga.statusCarga as StatusCargaEnum;
    if (ehTerminal(status)) {
      throw new ConflictException(
        `Carga ${status} não pode mais ser alterada.`,
      );
    }

    let classeRiscoONU = carga.classeRiscoONU;
    if (body.produtoQuimicoId !== carga.produtoQuimicoId) {
      if (status !== StatusCargaEnum.CADASTRADA) {
        throw new ConflictException(
          'O produto só pode ser alterado enquanto a carga está CADASTRADA.',
        );
      }
      const produto = await this.getProdutoAtivo(body.produtoQuimicoId);
      classeRiscoONU = produto.classeRisco;
    }

    await this.prisma.cargaQuimicas.update({
      where: { id },
      data: {
        produtoQuimicoId: body.produtoQuimicoId,
        quantidade: body.quantidade,
        unidadeMedida: body.unidadeMedida,
        destino: body.destino,
        classeRiscoONU,
      },
    });

    return await this.findOne({ id });
  }

  async remove({ id }: { id: number }): Promise<{ id: number }> {
    const carga = await this.prisma.cargaQuimicas.findUnique({ where: { id } });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }
    if (carga.statusCarga !== StatusCargaEnum.CADASTRADA) {
      throw new ConflictException(
        'Só é possível excluir cargas CADASTRADAS. Nos demais status, use o cancelamento.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.movimentacoes.deleteMany({ where: { cargaQuimicaId: id } });
      await tx.cargaQuimicas.delete({ where: { id } });
    });

    return { id };
  }

  private async getProdutoAtivo(produtoQuimicoId: number) {
    const produto = await this.prisma.produtosQuimicos.findUnique({
      where: { id: produtoQuimicoId },
    });
    if (!produto) {
      throw new BadRequestException('Produto químico não encontrado');
    }
    if (!produto.status) {
      throw new BadRequestException(
        'Produto químico inativo não pode ser usado em cargas.',
      );
    }
    return produto;
  }
}