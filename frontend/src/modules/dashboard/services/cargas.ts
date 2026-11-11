import { loads } from '@/infrastructure/mocks/dashboard';
import type { DashboardLoad } from '@/modules/dashboard/models/dashboard';

export function listarCargas(): DashboardLoad[] {
  return loads.map((load) => ({ ...load }));
}

export function buscarCarga(codigo: string): DashboardLoad | null {
  return loads.find((load) => load.code === codigo) ?? null;
}
