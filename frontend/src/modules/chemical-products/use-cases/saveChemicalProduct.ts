import {
  createChemicalProduct,
  deactivateChemicalProduct,
  updateChemicalProduct,
} from '@/modules/chemical-products/services/chemicalProductService';
import type { ChemicalProductInput } from '@/modules/chemical-products/models/chemicalProduct';

export function createProduct(input: ChemicalProductInput) {
  return createChemicalProduct(input);
}

export function updateProduct(id: number, input: ChemicalProductInput) {
  return updateChemicalProduct(id, input);
}

export function deactivateProduct(id: number) {
  return deactivateChemicalProduct(id);
}
