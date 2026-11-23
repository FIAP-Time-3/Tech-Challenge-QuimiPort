import type { StatusCarga } from '@/infrastructure/backend/dtos/cargaQuimica.dtos';

export interface CargaQuimicaResumo {
  id: number;
  statusCode: StatusCarga;
  code: string;
  product: string;
  category: string;
  origin: string;
  quantity: string;
  status: string;
  updated: string;
}
