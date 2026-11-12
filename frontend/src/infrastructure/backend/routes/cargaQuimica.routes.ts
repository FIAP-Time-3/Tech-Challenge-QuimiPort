import { api } from '../api';
import type {
  CargaQuimicaResponseDto,
  CreateDocumentoRequestDto,
  CreateOrUpdateCargaQuimicaRequestDto,
  DocumentoResponseDto,
  MotivoRequestDto,
  MovimentacaoResponseDto,
  StatusCarga,
  TransicoesResponseDto,
  UpdateStatusRequestDto,
} from '../dtos/cargaQuimica.dtos';

const baseUrl = 'cargas-quimicas';

export const cargaQuimicaApiRoutes = {
  transicoes: (status: StatusCarga) => {
    return api.get<TransicoesResponseDto>(`${baseUrl}/transicoes/${status}`);
  },
  create: (data: CreateOrUpdateCargaQuimicaRequestDto) => {
    return api.post<CargaQuimicaResponseDto>(baseUrl, data);
  },
  findAll: () => {
    return api.get<CargaQuimicaResponseDto[]>(baseUrl);
  },
  findOne: (id: number) => {
    return api.get<CargaQuimicaResponseDto>(`${baseUrl}/${id}`);
  },
  update: (id: number, data: CreateOrUpdateCargaQuimicaRequestDto) => {
    return api.put<CargaQuimicaResponseDto>(`${baseUrl}/${id}`, data);
  },
  historico: (id: number) => {
    return api.get<MovimentacaoResponseDto[]>(`${baseUrl}/${id}/historico`);
  },
  atualizarStatus: (id: number, data: UpdateStatusRequestDto) => {
    return api.patch<CargaQuimicaResponseDto>(`${baseUrl}/${id}/status`, data);
  },
  bloquear: (id: number, data: MotivoRequestDto) => {
    return api.patch<CargaQuimicaResponseDto>(
      `${baseUrl}/${id}/bloquear`,
      data,
    );
  },
  liberar: (id: number) => {
    return api.patch<CargaQuimicaResponseDto>(`${baseUrl}/${id}/liberar`);
  },
  cancelar: (id: number, data: MotivoRequestDto) => {
    return api.patch<CargaQuimicaResponseDto>(
      `${baseUrl}/${id}/cancelar`,
      data,
    );
  },
  adicionarDocumento: (id: number, data: CreateDocumentoRequestDto) => {
    const formData = new FormData();
    formData.append('tipoDocumento', data.tipoDocumento);
    formData.append('arquivo', data.arquivo);

    return api.post<DocumentoResponseDto>(
      `${baseUrl}/${id}/documentos`,
      formData,
      {
        // O navegador define o boundary do multipart.
        headers: { 'Content-Type': undefined },
      },
    );
  },
  obterArquivoDocumento: (id: number, docId: number) => {
    return api.get<Blob>(`${baseUrl}/${id}/documentos/${docId}`, {
      responseType: 'blob',
    });
  },
  validarDocumento: (id: number, docId: number) => {
    return api.patch<DocumentoResponseDto>(
      `${baseUrl}/${id}/documentos/${docId}/validar`,
    );
  },
};
