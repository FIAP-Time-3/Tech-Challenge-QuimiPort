import { StatusCargaEnum as S } from './value-objects/StatusCarga.enum.js';

export const transicoes: Record<S, readonly S[]> = {
  [S.CADASTRADA]: [S.EM_PREPARACAO, S.CANCELADA],
  [S.EM_PREPARACAO]: [S.EM_INSPECAO, S.CANCELADA],
  [S.EM_INSPECAO]: [S.LIBERADA, S.BLOQUEADA, S.CANCELADA],
  [S.BLOQUEADA]: [S.EM_PREPARACAO, S.CANCELADA],
  [S.LIBERADA]: [S.EM_MOVIMENTACAO, S.CANCELADA],
  [S.EM_MOVIMENTACAO]: [S.FINALIZADA, S.CANCELADA],
  [S.FINALIZADA]: [],
  [S.CANCELADA]: [],
};

export function podeTransicionar(de: S, para: S): boolean {
  return transicoes[de].includes(para);
}

export function ehTerminal(status: S): boolean {
  return transicoes[status].length === 0;
}

export const STATUS_QUE_EXIGEM_MOTIVO: readonly S[] = [
  S.BLOQUEADA,
  S.CANCELADA,
];
