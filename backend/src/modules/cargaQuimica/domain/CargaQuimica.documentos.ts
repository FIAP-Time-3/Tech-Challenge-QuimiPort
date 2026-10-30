import { TipoDocumentoEnum } from './value-objects/TipoDocumento.enum.js';

export const DOCUMENTOS_OBRIGATORIOS: readonly TipoDocumentoEnum[] = [
  TipoDocumentoEnum.FISPQ,
  TipoDocumentoEnum.NOTA_FISCAL,
];

export function documentosFaltantes(
  documentos: { tipoDocumento: string; validado: boolean }[],
): TipoDocumentoEnum[] {
  return DOCUMENTOS_OBRIGATORIOS.filter(
    (tipo) => !documentos.some((d) => d.tipoDocumento === tipo && d.validado),
  );
}
