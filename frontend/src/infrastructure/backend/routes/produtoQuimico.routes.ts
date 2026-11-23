import { api } from '../api';
import type {
  PaginatedResponseDto,
  PaginationQueryDto,
} from '../dtos/pagination.dtos';
import type {
  CreateOrUpdateProdutoQuimicoRequestDto,
  ProdutoQuimicoResponseDto,
  RemoveProdutoQuimicoResponseDto,
} from '../dtos/produtoQuimico.dtos';

const baseUrl = 'produtos-quimicos';

export const produtoQuimicoApiRoutes = {
  create: (data: CreateOrUpdateProdutoQuimicoRequestDto) => {
    return api.post<ProdutoQuimicoResponseDto>(baseUrl, data);
  },
  findAll: (params?: PaginationQueryDto) => {
    return api.get<PaginatedResponseDto<ProdutoQuimicoResponseDto>>(baseUrl, {
      params,
    });
  },
  findOne: (id: number) => {
    return api.get<ProdutoQuimicoResponseDto>(`${baseUrl}/${id}`);
  },
  update: (id: number, data: CreateOrUpdateProdutoQuimicoRequestDto) => {
    return api.put<ProdutoQuimicoResponseDto>(`${baseUrl}/${id}`, data);
  },
  inativar: (id: number) => {
    return api.patch<ProdutoQuimicoResponseDto>(`${baseUrl}/${id}/inativar`);
  },
  remove: (id: number) => {
    return api.delete<RemoveProdutoQuimicoResponseDto>(`${baseUrl}/${id}`);
  },
};
