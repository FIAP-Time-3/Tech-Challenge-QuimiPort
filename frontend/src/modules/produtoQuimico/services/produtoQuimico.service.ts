import axios from 'axios';
import { produtoQuimicoApiRoutes } from '@/infrastructure/backend/routes/produtoQuimico.routes';
import type { ProdutoQuimicoResponseDto } from '@/infrastructure/backend/dtos/produtoQuimico.dtos';
import type {
  ProdutoQuimico,
  ProdutoQuimicoInput,
} from '@/modules/produtoQuimico/models/produtoQuimico';

function paraProdutoQuimico(data: ProdutoQuimicoResponseDto): ProdutoQuimico {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao ?? '',
    classeRisco: data.classeRisco,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listarProdutosQuimicos(): Promise<ProdutoQuimico[]> {
  const { data } = await produtoQuimicoApiRoutes.findAll();
  return data.map(paraProdutoQuimico);
}

export async function buscarProdutoQuimico(
  id: number,
): Promise<ProdutoQuimico | null> {
  try {
    const { data } = await produtoQuimicoApiRoutes.findOne(id);
    return paraProdutoQuimico(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      return null;
    throw error;
  }
}

export async function criarProdutoQuimico(
  input: ProdutoQuimicoInput,
): Promise<ProdutoQuimico> {
  const { data } = await produtoQuimicoApiRoutes.create(input);
  return paraProdutoQuimico(data);
}

export async function atualizarProdutoQuimico(
  id: number,
  input: ProdutoQuimicoInput,
): Promise<ProdutoQuimico> {
  const { data } = await produtoQuimicoApiRoutes.update(id, input);
  return paraProdutoQuimico(data);
}

export async function excluirProdutoQuimico(id: number): Promise<void> {
  await produtoQuimicoApiRoutes.remove(id);
}

export async function inativarProdutoQuimico(
  id: number,
): Promise<ProdutoQuimico> {
  const { data } = await produtoQuimicoApiRoutes.inativar(id);
  return paraProdutoQuimico(data);
}
