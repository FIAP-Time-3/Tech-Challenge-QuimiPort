import { gerarCodigoCarga } from './CargaQuimica.codigo.js';
import {
  DOCUMENTOS_OBRIGATORIOS,
  documentosFaltantes,
} from './CargaQuimica.documentos.js';

describe('documentos obrigatórios', () => {
  it('lista todos quando nenhum foi registrado', () => {
    expect(documentosFaltantes([])).toEqual([...DOCUMENTOS_OBRIGATORIOS]);
  });

  it('ignora documento ainda não validado', () => {
    expect(
      documentosFaltantes([
        { tipoDocumento: 'FISPQ', validado: true },
        { tipoDocumento: 'NOTA_FISCAL', validado: false },
      ]),
    ).toEqual(['NOTA_FISCAL']);
  });

  it('não falta nada quando todos estão validados', () => {
    expect(
      documentosFaltantes([
        { tipoDocumento: 'FISPQ', validado: true },
        { tipoDocumento: 'NOTA_FISCAL', validado: true },
      ]),
    ).toEqual([]);
  });
});

describe('código da carga', () => {
  it('é derivado do id com zeros à esquerda', () => {
    expect(gerarCodigoCarga(12)).toBe('CQ-000012');
  });
});
