import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginatedQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'Campo usado para selecionar a página de resultados',
    default: 1,
  })
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Max(100)
  @ApiPropertyOptional({
    description: 'Campo usado para selecionar quantidade de itens na paginação',
    default: 10,
  })
  limit: number = 10;
}
