import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProdutoQuimicoResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Acetona' })
  @Expose()
  nome: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Solvente' })
  @Expose()
  descricao: string | null;

  @ApiProperty({ example: 3, description: 'Classe de risco ONU, de 1 a 9' })
  @Expose()
  classeRisco: number;

  @ApiProperty({ example: true, description: 'true = ativo, false = inativo' })
  @Expose()
  status: boolean;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
