import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../../infra/database/prisma.service.js';
import { gerarCodigoCarga } from '../domain/CargaQuimica.codigo.js';
import { documentosFaltantes } from '../domain/CargaQuimica.documentos.js';
import {
  ehTerminal,
  podeTransicionar,
  STATUS_QUE_EXIGEM_MOTIVO,
} from '../domain/CargaQuimica.transicoes.js';
import { StatusCargaEnum } from '../domain/value-objects/StatusCarga.enum.js';
import { TipoDocumentoEnum } from '../domain/value-objects/TipoDocumento.enum.js';
import { CreateOrUpdateCargaQuimicaDto } from '../infrastructure/dtos/CargaQuimica.request.dtos.js';
import {
  CargaQuimicaResponseDto,
  DocumentoResponseDto,
  MovimentacaoResponseDto,
} from '../infrastructure/dtos/CargaQuimica.response.dtos.js';
import {
  perfilPodeAgir,
  perfilPodeCancelar,
  type UsuarioLogado,
} from './CargaQuimica.permissoes.js';

const INCLUDE_CARGA = {
  produtoQuimico: true,
  documentoCargases: true,
} as const;

@Injectable()
export class CargaQuimicaService {
  private readonly logger = new Logger(CargaQuimicaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create({
    body,
    usuario,
  }: {
    body: CreateOrUpdateCargaQuimicaDto;
    usuario: UsuarioLogado;
  }): Promise<CargaQuimicaResponseDto> {
    const produto = await this.getProdutoAtivo(body.produtoQuimicoId);

    const carga = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cargaQuimicas.create({
        data: {
          produtoQuimicoId: produto.id,
          quantidade: body.quantidade,
          unidadeMedida: body.unidadeMedida,
          origem: body.origem,
          destino: body.destino,
          responsavelTecnico: body.responsavelTecnico,
          dataEntrada: body.dataEntrada,
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
          usuarioId: usuario.id,
        },
      });

      return created;
    });

    this.logger.log(
      `Carga ${gerarCodigoCarga(carga.id)} registrada (produto ${produto.id}, usuário ${usuario.id})`,
    );
    return await this.findOne({ id: carga.id });
  }

  async findAll(): Promise<CargaQuimicaResponseDto[]> {
    const cargas = await this.prisma.cargaQuimicas.findMany({
      include: INCLUDE_CARGA,
      orderBy: { id: 'asc' },
    });
    return cargas.map((carga) => this.toResponse(carga));
  }

  async findOne({ id }: { id: number }): Promise<CargaQuimicaResponseDto> {
    const carga = await this.prisma.cargaQuimicas.findUnique({
      where: { id },
      include: INCLUDE_CARGA,
    });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }
    return this.toResponse(carga);
  }

  async historico({ id }: { id: number }): Promise<MovimentacaoResponseDto[]> {
    await this.getCarga(id);
    const movimentacoes = await this.prisma.movimentacoes.findMany({
      where: { cargaQuimicaId: id },
      orderBy: { step: 'asc' },
    });
    return plainToInstance(MovimentacaoResponseDto, movimentacoes, {
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
    const carga = await this.getCarga(id);

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
        origem: body.origem,
        destino: body.destino,
        responsavelTecnico: body.responsavelTecnico,
        dataEntrada: body.dataEntrada,
        classeRiscoONU,
      },
    });

    return await this.findOne({ id });
  }

  // Única porta de entrada para mudar o status da carga.
  async transicionar({
    id,
    statusDestino,
    motivo,
    usuario,
  }: {
    id: number;
    statusDestino: StatusCargaEnum;
    motivo?: string;
    usuario: UsuarioLogado;
  }): Promise<CargaQuimicaResponseDto> {
    const carga = await this.prisma.cargaQuimicas.findUnique({
      where: { id },
      include: { documentoCargases: true },
    });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }
    const statusAtual = carga.statusCarga as StatusCargaEnum;

    const autorizado =
      statusDestino === StatusCargaEnum.CANCELADA
        ? perfilPodeCancelar(usuario.roles)
        : perfilPodeAgir(usuario.roles, statusAtual);
    if (!autorizado) {
      throw new ForbiddenException(
        'Seu perfil não pode executar esta ação na etapa atual da carga.',
      );
    }

    if (!podeTransicionar(statusAtual, statusDestino)) {
      this.logger.warn(
        `Transição recusada na carga ${gerarCodigoCarga(id)}: ${statusAtual} -> ${statusDestino}`,
      );
      throw new ConflictException(
        `Transição inválida: ${statusAtual} -> ${statusDestino}.`,
      );
    }

    const motivoLimpo = motivo?.trim();
    if (STATUS_QUE_EXIGEM_MOTIVO.includes(statusDestino) && !motivoLimpo) {
      throw new BadRequestException(
        'O motivo é obrigatório para bloquear ou cancelar a carga.',
      );
    }

    if (statusDestino === StatusCargaEnum.LIBERADA) {
      const faltantes = documentosFaltantes(carga.documentoCargases);
      if (faltantes.length > 0) {
        throw new ConflictException(
          `Documentação obrigatória pendente: ${faltantes.join(', ')}.`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      const ultimo = await tx.movimentacoes.aggregate({
        where: { cargaQuimicaId: id },
        _max: { step: true },
      });

      await tx.cargaQuimicas.update({
        where: { id },
        data: { statusCarga: statusDestino },
      });

      await tx.movimentacoes.create({
        data: {
          cargaQuimicaId: id,
          step: (ultimo._max.step ?? 0) + 1,
          statusAnterior: statusAtual,
          statusAtual: statusDestino,
          notes: motivoLimpo ?? null,
          usuarioId: usuario.id,
        },
      });
    });

    this.logger.log(
      `Carga ${gerarCodigoCarga(id)}: ${statusAtual} -> ${statusDestino} (usuário ${usuario.id})`,
    );
    return await this.findOne({ id });
  }

  async bloquear(args: { id: number; motivo: string; usuario: UsuarioLogado }) {
    return await this.transicionar({
      ...args,
      statusDestino: StatusCargaEnum.BLOQUEADA,
    });
  }

  async liberar(args: { id: number; usuario: UsuarioLogado }) {
    return await this.transicionar({
      ...args,
      statusDestino: StatusCargaEnum.LIBERADA,
    });
  }

  async cancelar(args: { id: number; motivo: string; usuario: UsuarioLogado }) {
    return await this.transicionar({
      ...args,
      statusDestino: StatusCargaEnum.CANCELADA,
    });
  }

  async adicionarDocumento({
    id,
    tipoDocumento,
  }: {
    id: number;
    tipoDocumento: TipoDocumentoEnum;
  }): Promise<DocumentoResponseDto> {
    const carga = await this.getCarga(id);
    if (ehTerminal(carga.statusCarga as StatusCargaEnum)) {
      throw new ConflictException(
        'Carga finalizada ou cancelada não aceita novos documentos.',
      );
    }

    const existente = await this.prisma.documentoCargas.findFirst({
      where: { cargaQuimicaId: id, tipoDocumento },
    });
    if (existente) {
      throw new ConflictException(
        `O documento ${tipoDocumento} já está registrado nesta carga.`,
      );
    }

    const documento = await this.prisma.documentoCargas.create({
      data: { cargaQuimicaId: id, tipoDocumento, validado: false },
    });
    this.logger.log(
      `Documento ${tipoDocumento} registrado na carga ${gerarCodigoCarga(id)}`,
    );
    return plainToInstance(DocumentoResponseDto, documento, {
      excludeExtraneousValues: true,
    });
  }

  async validarDocumento({
    id,
    docId,
  }: {
    id: number;
    docId: number;
  }): Promise<DocumentoResponseDto> {
    await this.getCarga(id);
    const documento = await this.prisma.documentoCargas.findFirst({
      where: { id: docId, cargaQuimicaId: id },
    });
    if (!documento) {
      throw new NotFoundException('Documento não encontrado nesta carga');
    }

    const atualizado = await this.prisma.documentoCargas.update({
      where: { id: docId },
      data: { validado: true },
    });
    this.logger.log(
      `Documento ${atualizado.tipoDocumento} validado na carga ${gerarCodigoCarga(id)}`,
    );
    return plainToInstance(DocumentoResponseDto, atualizado, {
      excludeExtraneousValues: true,
    });
  }

  private toResponse(carga: {
    id: number;
    documentoCargases: unknown;
  }): CargaQuimicaResponseDto {
    return plainToInstance(
      CargaQuimicaResponseDto,
      {
        ...carga,
        codigo: gerarCodigoCarga(carga.id),
        documentos: carga.documentoCargases,
      },
      { excludeExtraneousValues: true },
    );
  }

  private async getCarga(id: number) {
    const carga = await this.prisma.cargaQuimicas.findUnique({ where: { id } });
    if (!carga) {
      throw new NotFoundException('Carga química não encontrada');
    }
    return carga;
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
