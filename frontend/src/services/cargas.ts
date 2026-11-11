import { api } from '@/lib/api';

export interface CargaQuimica {
  id: number;
  codigo: string;
  produtoQuimicoId: number;
  produtoQuimico: {
    id: number;
    nome: string;
    classeRisco: number;
    status: boolean;
  };
  quantidade: number;
  unidadeMedida: string;
  origem: string;
  destino: string;
  dataEntrada: string;
  statusCarga: string;
  classeRiscoONU: number;
}

export async function listarCargas(): Promise<CargaQuimica[]> {
  const { data } = await api.get<CargaQuimica[]>('/cargas-quimicas');
  return data;
}

export async function buscarCarga(id: number): Promise<CargaQuimica> {
  const { data } = await api.get<CargaQuimica>(`/cargas-quimicas/${id}`);
  return data;
}
