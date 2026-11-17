import { ApiProperty } from '@nestjs/swagger';
import { TipoDocumentoEnum } from '../../domain/value-objects/TipoDocumento.enum.js';
import { StatusCargaEnum } from '../../domain/value-objects/StatusCarga.enum.js';
import { Expose, Type } from 'class-transformer';

export class ProdutoResumoDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;
  @ApiProperty({ type: String })
  @Expose()
  nome: string;
  @ApiProperty({
    type: String,
    minLength: 4,
    maxLength: 4,
    pattern: '^(?!0000)[0-9]{4}$',
    example: '1090',
  })
  @Expose()
  numeroONU: string;
  @ApiProperty({ type: 'integer' })
  @Expose()
  classeRisco: number;
  @ApiProperty({ type: Boolean })
  @Expose()
  status: boolean;
}

export class DocumentoResponseDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;
  @ApiProperty({ enum: TipoDocumentoEnum })
  @Expose()
  tipoDocumento: string;
  @ApiProperty({ type: Boolean })
  @Expose()
  validado: boolean;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
}

export class MovimentacaoResponseDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;
  @ApiProperty({ type: 'integer' })
  @Expose()
  step: number;
  @ApiProperty({
    type: String,
    enum: Object.values(StatusCargaEnum),
    nullable: true,
  })
  @Expose()
  statusAnterior: string | null;
  @ApiProperty({ enum: StatusCargaEnum })
  @Expose()
  statusAtual: string;
  @ApiProperty({ type: String, nullable: true })
  @Expose()
  notes: string | null;
  @ApiProperty({ type: 'integer', nullable: true })
  @Expose()
  usuarioId: number | null;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  date: Date;
}

export class ResponsavelTecnicoDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;
  @ApiProperty({ type: String })
  @Expose()
  name: string;
  @ApiProperty({ format: 'email' })
  @Expose()
  email: string;
}

export class CargaQuimicaResponseDto {
  @ApiProperty({ type: 'integer' })
  @Expose()
  id: number;
  @ApiProperty({ type: String })
  @Expose()
  codigo: string;
  @ApiProperty({ type: 'integer' })
  @Expose()
  produtoQuimicoId: number;

  @Expose()
  @ApiProperty({ type: () => ProdutoResumoDto })
  @Type(() => ProdutoResumoDto)
  produtoQuimico: ProdutoResumoDto;

  @ApiProperty({ type: 'integer' })
  @Expose()
  quantidade: number;
  @ApiProperty({ type: String })
  @Expose()
  unidadeMedida: string;
  @ApiProperty({ type: String })
  @Expose()
  origem: string;
  @ApiProperty({ type: String })
  @Expose()
  destino: string;
  @ApiProperty({ type: 'integer', nullable: true })
  @Expose()
  responsavelTecnicoId: number | null;
  @Expose()
  @ApiProperty({ type: () => ResponsavelTecnicoDto, nullable: true })
  @Type(() => ResponsavelTecnicoDto)
  responsavelTecnico: ResponsavelTecnicoDto | null;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  dataEntrada: Date;
  @ApiProperty({ enum: StatusCargaEnum })
  @Expose()
  statusCarga: string;
  @ApiProperty({ type: 'integer' })
  @Expose()
  classeRiscoONU: number;

  @Expose()
  @ApiProperty({ type: () => [DocumentoResponseDto] })
  @Type(() => DocumentoResponseDto)
  documentos: DocumentoResponseDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt: Date;
}
