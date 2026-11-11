import { listChemicalProducts as list } from '@/modules/chemical-products/services/chemicalProductService';

export function listChemicalProducts() {
  return list();
}
