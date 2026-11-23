import type {
  PaginatedResponseDto,
  PaginationQueryDto,
} from './dtos/pagination.dtos';

export async function listAllPages<T>(
  fetchPage: (
    params: PaginationQueryDto,
  ) => Promise<{ data: PaginatedResponseDto<T> }>,
): Promise<T[]> {
  const limit = 100;
  const { data: firstPage } = await fetchPage({ page: 1, limit });
  const items = [...firstPage.data];

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const { data } = await fetchPage({ page, limit });
    items.push(...data.data);
  }

  return items;
}
