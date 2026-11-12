import { cargaQuimicaApiRoutes } from '@/infrastructure/backend/routes/cargaQuimica.routes';
import type {
  CargaQuimicaResponseDto,
  StatusCarga,
} from '@/infrastructure/backend/dtos/cargaQuimica.dtos';
import type { CargaQuimicaResumo } from '@/modules/dashboard/models/cargaQuimica';

export const rotulosStatusCarga: Record<StatusCarga, string> = {
  CADASTRADA: 'Cadastrada',
  EM_PREPARACAO: 'Em preparação',
  EM_INSPECAO: 'Em inspeção',
  BLOQUEADA: 'Bloqueada',
  LIBERADA: 'Liberada',
  EM_MOVIMENTACAO: 'Em movimentação',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

export function paraCargaQuimicaResumo(
  load: CargaQuimicaResponseDto,
): CargaQuimicaResumo {
  return {
    code: load.codigo,
    product: load.produtoQuimico.nome,
    category: `Classe ${load.classeRiscoONU}`,
    origin: load.origem,
    quantity: `${load.quantidade.toLocaleString('pt-BR')} ${load.unidadeMedida}`,
    status: rotulosStatusCarga[load.statusCarga],
    updated: new Date(load.updatedAt).toLocaleString('pt-BR'),
  };
}

export async function listarCargasQuimicas(): Promise<CargaQuimicaResumo[]> {
  const { data } = await cargaQuimicaApiRoutes.findAll();
  return data
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .map(paraCargaQuimicaResumo);
}

export async function buscarCargaQuimica(
  codigo: string,
): Promise<CargaQuimicaResumo | null> {
  return (
    (await listarCargasQuimicas()).find((load) => load.code === codigo) ?? null
  );
}
