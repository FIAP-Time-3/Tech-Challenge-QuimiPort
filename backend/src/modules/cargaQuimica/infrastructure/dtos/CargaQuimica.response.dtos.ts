import { Expose, Type } from 'class-transformer';

export class ProdutoResumoDto {
  @Expose() id: number;
  @Expose() nome: string;
  @Expose() classeRisco: number;
  @Expose() status: boolean;
}

export class DocumentoResponseDto {
  @Expose() id: number;
  @Expose() tipoDocumento: string;
  @Expose() validado: boolean;
  @Expose() createdAt: Date;
}

export class MovimentacaoResponseDto {
  @Expose() id: number;
  @Expose() step: number;
  @Expose() statusAnterior: string | null;
  @Expose() statusAtual: string;
  @Expose() notes: string | null;
  @Expose() usuarioId: number | null;
  @Expose() date: Date;
}

export class ResponsavelTecnicoDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() username: string;
}

export class CargaQuimicaResponseDto {
  @Expose() id: number;
  @Expose() codigo: string;
  @Expose() produtoQuimicoId: number;

  @Expose()
  @Type(() => ProdutoResumoDto)
  produtoQuimico: ProdutoResumoDto;

  @Expose() quantidade: number;
  @Expose() unidadeMedida: string;
  @Expose() origem: string;
  @Expose() destino: string;
  @Expose() responsavelTecnicoId: number | null;
  @Expose()
  @Type(() => ResponsavelTecnicoDto)
  responsavelTecnico: ResponsavelTecnicoDto | null;
  @Expose() dataEntrada: Date;
  @Expose() statusCarga: string;
  @Expose() classeRiscoONU: number;

  @Expose()
  @Type(() => DocumentoResponseDto)
  documentos: DocumentoResponseDto[];

  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
