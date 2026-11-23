import { StatusCargaEnum as S } from '../domain/value-objects/status-carga.enum.js';
import {
  perfilPodeAgir,
  perfilPodeCancelar,
} from './carga-quimica.permissoes.js';

describe('permissões por etapa', () => {
  it.each([
    S.CADASTRADA,
    S.EM_PREPARACAO,
    S.EM_INSPECAO,
    S.BLOQUEADA,
    S.LIBERADA,
    S.EM_MOVIMENTACAO,
  ])('permite administrador e operador na etapa %s', (status) => {
    expect(perfilPodeAgir('ADMINISTRADOR', status)).toBe(true);
    expect(perfilPodeAgir('OPERADOR', status)).toBe(true);
    expect(perfilPodeAgir('DESPACHANTE', status)).toBe(false);
  });

  it('reserva o cancelamento ao administrador e ao operador', () => {
    expect(perfilPodeCancelar('ADMINISTRADOR')).toBe(true);
    expect(perfilPodeCancelar('OPERADOR')).toBe(true);
    expect(perfilPodeCancelar('DESPACHANTE')).toBe(false);
  });
});
