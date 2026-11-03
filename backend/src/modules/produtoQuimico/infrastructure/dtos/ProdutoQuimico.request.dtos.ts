import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateOrUpdateProdutoQuimicoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  descricao: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(9)
  classeRisco: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  status: boolean;
}
