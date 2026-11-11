import { chemicalProducts } from '@/infrastructure/mocks/chemicalProducts';
import type {
  ChemicalProduct,
  ChemicalProductInput,
} from '@/modules/chemical-products/models/chemicalProduct';

export function listChemicalProducts(): ChemicalProduct[] {
  return chemicalProducts.map((product) => ({ ...product }));
}

export function getChemicalProduct(id: number): ChemicalProduct | null {
  return chemicalProducts.find((product) => product.id === id) ?? null;
}

export function createChemicalProduct(
  input: ChemicalProductInput,
): ChemicalProduct {
  const product: ChemicalProduct = {
    ...input,
    id: Math.max(0, ...chemicalProducts.map(({ id }) => id)) + 1,
  };
  chemicalProducts.push(product);
  return { ...product };
}

export function updateChemicalProduct(
  id: number,
  input: ChemicalProductInput,
): ChemicalProduct | null {
  const index = chemicalProducts.findIndex((product) => product.id === id);

  if (index === -1) {
    return null;
  }

  chemicalProducts[index] = { ...input, id };
  return { ...chemicalProducts[index] };
}

export function deleteChemicalProduct(id: number): boolean {
  const index = chemicalProducts.findIndex((product) => product.id === id);

  if (index === -1) {
    return false;
  }

  chemicalProducts.splice(index, 1);
  return true;
}
