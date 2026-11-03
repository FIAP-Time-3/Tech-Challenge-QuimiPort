import { RolesEnum } from '../../../infra/security/enums/roles.enum.js';
import { StatusCargaEnum as S } from '../domain/value-objects/StatusCarga.enum.js';

export interface UsuarioLogado {
  id: number;
  roles: string[];
}

// Quem atua em cada etapa (PM-04 a PM-07). Administrador e gestor atuam em todas.
const PERFIS_POR_STATUS: Record<S, RolesEnum[]> = {
  [S.CADASTRADA]: [RolesEnum.TECNICO],
  [S.EM_PREPARACAO]: [RolesEnum.TECNICO, RolesEnum.DOCUMENTACAO],
  [S.EM_INSPECAO]: [RolesEnum.QUALIDADE, RolesEnum.INSPETOR],
  [S.BLOQUEADA]: [RolesEnum.TECNICO],
  [S.LIBERADA]: [RolesEnum.OPERADOR],
  [S.EM_MOVIMENTACAO]: [RolesEnum.OPERADOR],
  [S.FINALIZADA]: [],
  [S.CANCELADA]: [],
};

export function perfilPodeCancelar(roles: string[]): boolean {
  return (
    roles.includes(RolesEnum.ADMINISTRADOR) || roles.includes(RolesEnum.GESTOR)
  );
}

export function perfilPodeAgir(roles: string[], statusAtual: S): boolean {
  if (perfilPodeCancelar(roles)) {
    return true;
  }
  return PERFIS_POR_STATUS[statusAtual].some((perfil) =>
    roles.includes(perfil),
  );
}
