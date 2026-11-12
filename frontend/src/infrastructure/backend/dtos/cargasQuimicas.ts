export type StatusCarga =
  | 'CADASTRADA'
  | 'EM_PREPARACAO'
  | 'EM_INSPECAO'
  | 'BLOQUEADA'
  | 'LIBERADA'
  | 'EM_MOVIMENTACAO'
  | 'FINALIZADA'
  | 'CANCELADA';

export type TipoDocumento = 'FISPQ' | 'NOTA_FISCAL';

export interface CreateOrUpdateCargaQuimicaRequestDto {
  produtoQuimicoId: number;
  quantidade: number;
  unidadeMedida: string;
  origem: string;
  destino: string;
  responsavelTecnicoId: number;
  dataEntrada?: string;
}

export interface UpdateStatusRequestDto {
  statusCarga: StatusCarga;
  motivo?: string;
}

export interface MotivoRequestDto {
  motivo: string;
}

export interface CreateDocumentoRequestDto {
  tipoDocumento: TipoDocumento;
  arquivo: File;
}

export interface ProdutoResumoDto {
  id: number;
  nome: string;
  classeRisco: number;
  status: boolean;
}

export interface DocumentoResponseDto {
  id: number;
  tipoDocumento: TipoDocumento;
  validado: boolean;
  createdAt: string;
}

export interface MovimentacaoResponseDto {
  id: number;
  step: number;
  statusAnterior: StatusCarga | null;
  statusAtual: StatusCarga;
  notes: string | null;
  usuarioId: number | null;
  date: string;
}

export interface ResponsavelTecnicoDto {
  id: number;
  name: string;
  username: string;
}

export interface CargaQuimicaResponseDto {
  id: number;
  codigo: string;
  produtoQuimicoId: number;
  produtoQuimico: ProdutoResumoDto;
  quantidade: number;
  unidadeMedida: string;
  origem: string;
  destino: string;
  responsavelTecnicoId: number | null;
  responsavelTecnico: ResponsavelTecnicoDto | null;
  dataEntrada: string;
  statusCarga: StatusCarga;
  classeRiscoONU: number;
  documentos: DocumentoResponseDto[];
  createdAt: string;
  updatedAt: string;
}
