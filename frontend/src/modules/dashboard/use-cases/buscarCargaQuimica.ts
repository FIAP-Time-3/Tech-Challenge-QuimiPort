import { buscarCarga } from '@/modules/dashboard/services/cargaQuimica.service';

export function getCarga(codigo: string) {
  return buscarCarga(codigo);
}
