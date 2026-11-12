import { api } from '../api';
import type {
  CreateOrUpdateProdutoQuimicoRequestDto,
  ProdutoQuimicoResponseDto,
  RemoveProdutoQuimicoResponseDto,
} from '../dtos/produtosQuimicos';

const baseUrl = 'produtos-quimicos';

export const produtoQuimicoApiRoutes = {
  create: (data: CreateOrUpdateProdutoQuimicoRequestDto) => {
    return api.post<ProdutoQuimicoResponseDto>(baseUrl, data);
  },
  findAll: () => {
    return api.get<ProdutoQuimicoResponseDto[]>(baseUrl);
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
