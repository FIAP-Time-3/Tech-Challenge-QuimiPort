import { StatusCargaEnum as S } from '../domain/value-objects/StatusCarga.enum.js';
import {
  perfilPodeAgir,
  perfilPodeCancelar,
} from './CargaQuimica.permissoes.js';

describe('permissões por etapa', () => {
  it('administrador e gestor atuam em qualquer etapa', () => {
    expect(perfilPodeAgir(['ADMINISTRADOR'], S.EM_INSPECAO)).toBe(true);
    expect(perfilPodeAgir(['GESTOR'], S.LIBERADA)).toBe(true);
  });

  it('operador atua só em LIBERADA e EM_MOVIMENTACAO', () => {
    expect(perfilPodeAgir(['OPERADOR'], S.LIBERADA)).toBe(true);
    expect(perfilPodeAgir(['OPERADOR'], S.EM_MOVIMENTACAO)).toBe(true);
    expect(perfilPodeAgir(['OPERADOR'], S.EM_INSPECAO)).toBe(false);
  });

  it('qualidade atua só em EM_INSPECAO', () => {
    expect(perfilPodeAgir(['QUALIDADE'], S.EM_INSPECAO)).toBe(true);
    expect(perfilPodeAgir(['QUALIDADE'], S.CADASTRADA)).toBe(false);
  });

  it('só administrador e gestor cancelam', () => {
    expect(perfilPodeCancelar(['GESTOR'])).toBe(true);
    expect(perfilPodeCancelar(['TECNICO'])).toBe(false);
  });
});
