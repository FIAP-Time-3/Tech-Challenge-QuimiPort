import axios from 'axios';
import { produtoQuimicoApiRoutes } from '@/infrastructure/backend/routes/produtosQuimicos';
import type { ProdutoQuimicoResponseDto } from '@/infrastructure/backend/dtos/produtosQuimicos';
import type {
  ChemicalProduct,
  ChemicalProductInput,
} from '@/modules/chemical-products/models/chemicalProduct';

function toProduct(data: ProdutoQuimicoResponseDto): ChemicalProduct {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao ?? '',
    classeRisco: data.classeRisco,
    status: data.status,
  };
}

export async function listChemicalProducts(): Promise<ChemicalProduct[]> {
  const { data } = await produtoQuimicoApiRoutes.findAll();
  return data.map(toProduct);
}

export async function getChemicalProduct(
  id: number,
): Promise<ChemicalProduct | null> {
  try {
    const { data } = await produtoQuimicoApiRoutes.findOne(id);
    return toProduct(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      return null;
    throw error;
  }
}

export async function createChemicalProduct(
  input: ChemicalProductInput,
): Promise<ChemicalProduct> {
  const { data } = await produtoQuimicoApiRoutes.create(input);
  return toProduct(data);
}

export async function updateChemicalProduct(
  id: number,
  input: ChemicalProductInput,
): Promise<ChemicalProduct> {
  const { data } = await produtoQuimicoApiRoutes.update(id, input);
  return toProduct(data);
}

export async function deleteChemicalProduct(id: number): Promise<void> {
  await produtoQuimicoApiRoutes.remove(id);
}
