import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrUpdateCargaQuimicaDto } from './CargaQuimica.request.dtos.js';

const valido = {
  produtoQuimicoId: 1,
  quantidade: 10,
  unidadeMedida: 'kg',
  origem: 'Rotterdam',
  destino: 'Santos',
  responsavelTecnico: 'Maria Souza',
};

async function camposInvalidos(dados: Record<string, unknown>) {
  const erros = await validate(
    plainToInstance(CreateOrUpdateCargaQuimicaDto, dados),
  );
  return erros.map((erro) => erro.property);
}

describe('validação do cadastro de carga', () => {
  it('aceita dados válidos', async () => {
    expect(await camposInvalidos(valido)).toEqual([]);
  });

  it.each([0, -5])('recusa quantidade %s', async (quantidade) => {
    expect(await camposInvalidos({ ...valido, quantidade })).toContain(
      'quantidade',
    );
  });

  it.each([
    'produtoQuimicoId',
    'unidadeMedida',
    'origem',
    'destino',
    'responsavelTecnico',
  ])('recusa carga sem %s', async (campo) => {
    const dados: Record<string, unknown> = { ...valido };
    delete dados[campo];

    expect(await camposInvalidos(dados)).toContain(campo);
  });
});
