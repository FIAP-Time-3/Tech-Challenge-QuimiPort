import { buscarCarga } from '@/modules/dashboard/services/cargas';

export function getCarga(codigo: string) {
  return buscarCarga(codigo);
}
