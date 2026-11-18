import { RolesEnum } from '../../../infra/security/enums/roles.enum.js';
import { StatusCargaEnum as S } from '../domain/value-objects/StatusCarga.enum.js';

export interface UsuarioLogado {
  id: number;
  role: string;
}

const PERFIS_POR_STATUS: Record<S, RolesEnum[]> = {
  [S.CADASTRADA]: [RolesEnum.OPERADOR],
  [S.EM_PREPARACAO]: [RolesEnum.OPERADOR],
  [S.EM_INSPECAO]: [RolesEnum.OPERADOR],
  [S.BLOQUEADA]: [RolesEnum.OPERADOR],
  [S.LIBERADA]: [RolesEnum.OPERADOR],
  [S.EM_MOVIMENTACAO]: [RolesEnum.OPERADOR],
  [S.FINALIZADA]: [],
  [S.CANCELADA]: [],
};

export function perfilPodeCancelar(role: string): boolean {
  return role === RolesEnum.ADMINISTRADOR || role === RolesEnum.OPERADOR;
}

export function perfilPodeAgir(role: string, statusAtual: S): boolean {
  if (perfilPodeCancelar(role)) {
    return true;
  }
  return PERFIS_POR_STATUS[statusAtual].some((perfil) => perfil === role);
}
