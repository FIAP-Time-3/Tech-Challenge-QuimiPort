import { IntersectionType } from '@nestjs/swagger';
import { PaginatedQueryDto } from './pagination/pagination.query.dtos.js';
import { SortQueryDto } from './sort/sort.query.dtos.js';

export class PaginatedSortQueryDto extends IntersectionType(
  PaginatedQueryDto,
  SortQueryDto,
) {}
