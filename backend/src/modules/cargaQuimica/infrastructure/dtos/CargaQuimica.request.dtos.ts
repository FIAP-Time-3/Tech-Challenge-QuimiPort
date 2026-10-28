import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateOrUpdateCargaQuimicaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  produtoQuimicoId: number;

  @ApiProperty({ example: 500 })
  @IsInt()
  @IsPositive()
  quantidade: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unidadeMedida: string;

  @ApiProperty({ example: 'Terminal 3 - Santos' })
  @IsString()
  @IsNotEmpty()
  destino: string;
}