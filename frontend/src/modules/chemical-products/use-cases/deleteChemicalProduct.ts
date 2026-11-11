import { deleteChemicalProduct } from '@/modules/chemical-products/services/chemicalProductService';

export function deleteProduct(id: number) {
  return deleteChemicalProduct(id);
}
