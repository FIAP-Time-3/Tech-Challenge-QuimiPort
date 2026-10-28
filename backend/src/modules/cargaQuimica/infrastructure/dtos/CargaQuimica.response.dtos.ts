import { Expose, Type } from 'class-transformer';

export class ProdutoResumoDto {
  @Expose() id: number;
  @Expose() nome: string;
  @Expose() classeRisco: number;
  @Expose() status: boolean;
}

export class CargaQuimicaResponseDto {
  @Expose() id: number;
  @Expose() produtoQuimicoId: number;

  @Expose()
  @Type(() => ProdutoResumoDto)
  produtoQuimico: ProdutoResumoDto;

  @Expose() quantidade: number;
  @Expose() unidadeMedida: string;
  @Expose() destino: string;
  @Expose() statusCarga: string;
  @Expose() classeRiscoONU: number;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}