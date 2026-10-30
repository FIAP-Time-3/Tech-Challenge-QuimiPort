import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { StatusCargaEnum } from '../../domain/value-objects/StatusCarga.enum.js';
import { TipoDocumentoEnum } from '../../domain/value-objects/TipoDocumento.enum.js';

export class CreateOrUpdateCargaQuimicaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  produtoQuimicoId: number;

  @ApiProperty({ example: 500, description: 'Deve ser maior que zero' })
  @IsInt()
  @IsPositive()
  quantidade: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unidadeMedida: string;

  @ApiProperty({ example: 'Porto de Rotterdam' })
  @IsString()
  @IsNotEmpty()
  origem: string;

  @ApiProperty({ example: 'Terminal 3 - Santos' })
  @IsString()
  @IsNotEmpty()
  destino: string;

  @ApiProperty({ example: 'Maria Souza', description: 'Obrigatório' })
  @IsString()
  @IsNotEmpty()
  responsavelTecnico: string;

  @ApiPropertyOptional({ example: '2026-11-01T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataEntrada?: Date;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusCargaEnum })
  @IsEnum(StatusCargaEnum)
  statusCarga: StatusCargaEnum;

  @ApiPropertyOptional({ example: 'Obrigatório ao bloquear ou cancelar' })
  @IsOptional()
  @IsString()
  motivo?: string;
}

export class MotivoDto {
  @ApiProperty({ example: 'Inconsistência na documentação' })
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

export class CreateDocumentoDto {
  @ApiProperty({ enum: TipoDocumentoEnum })
  @IsEnum(TipoDocumentoEnum)
  tipoDocumento: TipoDocumentoEnum;
}
