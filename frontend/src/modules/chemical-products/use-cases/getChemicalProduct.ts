import { getChemicalProduct as get } from '@/modules/chemical-products/services/chemicalProductService';

export function getChemicalProduct(id: number) {
  return get(id);
}
