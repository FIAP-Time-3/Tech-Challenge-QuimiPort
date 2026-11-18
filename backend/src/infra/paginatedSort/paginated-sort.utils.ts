import { PaginatedSortQueryDto } from './paginated-sort.query.dtos.js';
import { adjustPaginationOption } from './pagination/pagination.utils.js';
import { adjustSortOption } from './sort/sort.utils.js';

export function adjustPaginationAndSortOptions({
  paginatedSort,
  fields,
}: {
  paginatedSort: PaginatedSortQueryDto;
  fields: Record<string, string>;
}) {
  return {
    ...adjustPaginationOption({
      page: paginatedSort.page,
      limit: paginatedSort.limit,
    }),
    ...adjustSortOption({
      column: paginatedSort.column,
      order: paginatedSort.order,
      fields: fields,
    }),
  };
}
