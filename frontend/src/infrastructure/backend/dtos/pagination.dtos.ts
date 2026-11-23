export interface PaginationQueryDto {
  page?: number;
  limit?: number;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
