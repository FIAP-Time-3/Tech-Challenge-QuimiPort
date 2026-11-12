import { cargaQuimicaApiRoutes } from '@/infrastructure/backend/routes/cargaQuimica.routes';
import type {
  CargaQuimicaResponseDto,
  StatusCarga,
} from '@/infrastructure/backend/dtos/cargaQuimica.dtos';
import type { DashboardLoad } from '@/modules/dashboard/models/dashboard';

export const statusLabels: Record<StatusCarga, string> = {
  CADASTRADA: 'Cadastrada',
  EM_PREPARACAO: 'Em preparação',
  EM_INSPECAO: 'Em inspeção',
  BLOQUEADA: 'Bloqueada',
  LIBERADA: 'Liberada',
  EM_MOVIMENTACAO: 'Em movimentação',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

export function toDashboardLoad(load: CargaQuimicaResponseDto): DashboardLoad {
  return {
    code: load.codigo,
    product: load.produtoQuimico.nome,
    category: `Classe ${load.classeRiscoONU}`,
    origin: load.origem,
    quantity: `${load.quantidade.toLocaleString('pt-BR')} ${load.unidadeMedida}`,
    status: statusLabels[load.statusCarga],
    updated: new Date(load.updatedAt).toLocaleString('pt-BR'),
  };
}

export async function listarCargas(): Promise<DashboardLoad[]> {
  const { data } = await cargaQuimicaApiRoutes.findAll();
  return data
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .map(toDashboardLoad);
}

export async function buscarCarga(
  codigo: string,
): Promise<DashboardLoad | null> {
  return (await listarCargas()).find((load) => load.code === codigo) ?? null;
}
