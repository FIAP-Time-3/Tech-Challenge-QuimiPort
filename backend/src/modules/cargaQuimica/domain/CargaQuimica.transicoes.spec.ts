import { StatusCargaEnum as S } from './value-objects/StatusCarga.enum.js';
import { ehTerminal, podeTransicionar } from './CargaQuimica.transicoes.js';

const validas: [S, S][] = [
  [S.CADASTRADA, S.EM_PREPARACAO],
  [S.CADASTRADA, S.CANCELADA],
  [S.EM_PREPARACAO, S.EM_INSPECAO],
  [S.EM_PREPARACAO, S.CANCELADA],
  [S.EM_INSPECAO, S.LIBERADA],
  [S.EM_INSPECAO, S.BLOQUEADA],
  [S.EM_INSPECAO, S.CANCELADA],
  [S.BLOQUEADA, S.EM_PREPARACAO],
  [S.BLOQUEADA, S.CANCELADA],
  [S.LIBERADA, S.EM_MOVIMENTACAO],
  [S.LIBERADA, S.CANCELADA],
  [S.EM_MOVIMENTACAO, S.FINALIZADA],
  [S.EM_MOVIMENTACAO, S.CANCELADA],
];

const todos = Object.values(S);
const invalidas = todos
  .flatMap((de) => todos.map((para) => [de, para] as [S, S]))
  .filter(([de, para]) => !validas.some(([d, p]) => d === de && p === para));

describe('transições de status da carga', () => {
  it.each(validas)('permite %s -> %s', (de, para) => {
    expect(podeTransicionar(de, para)).toBe(true);
  });

  it.each(invalidas)('recusa %s -> %s', (de, para) => {
    expect(podeTransicionar(de, para)).toBe(false);
  });

  it('FINALIZADA e CANCELADA são terminais', () => {
    expect(ehTerminal(S.FINALIZADA)).toBe(true);
    expect(ehTerminal(S.CANCELADA)).toBe(true);
    expect(ehTerminal(S.CADASTRADA)).toBe(false);
  });
});
