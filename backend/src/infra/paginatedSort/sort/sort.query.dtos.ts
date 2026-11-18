import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional } from 'class-validator';

export class SortQueryDto {
  @Type(() => String)
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Campo usado para selecionar a coluna que será usada na ordenação',
    default: 'id',
  })
  column: string = 'id';

  @Type(() => String)
  @IsIn(['asc', 'desc'])
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "Campo usado para selecionar o tipo de ordenação ('asc' ou 'desc')",
    default: 'asc',
  })
  order: string = 'asc';
}
