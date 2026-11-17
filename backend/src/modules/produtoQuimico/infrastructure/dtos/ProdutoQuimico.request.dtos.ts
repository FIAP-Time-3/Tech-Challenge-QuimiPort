import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Length,
  Matches,
} from 'class-validator';

export class CreateOrUpdateProdutoQuimicoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descricao: string;

  @ApiProperty({
    example: '1090',
    minLength: 4,
    maxLength: 4,
    pattern: '^(?!0000)[0-9]{4}$',
  })
  @IsString()
  @Length(4, 4, {
    message: 'O número ONU deve conter exatamente quatro algarismos.',
  })
  @Matches(/^(?!0000)[0-9]{4}$/u, {
    message:
      'O número ONU deve conter quatro algarismos, sem prefixo, e ser diferente de 0000.',
  })
  numeroONU: string;

  @ApiProperty({ type: 'integer', minimum: 1, maximum: 9 })
  @IsInt()
  @Min(1)
  @Max(9)
  classeRisco: number;

  @ApiPropertyOptional({
    description: 'Padrão true no cadastro quando omitido.',
  })
  @IsBoolean()
  @IsOptional()
  status: boolean;
}
