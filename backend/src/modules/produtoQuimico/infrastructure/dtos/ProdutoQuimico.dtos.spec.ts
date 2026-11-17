import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrUpdateProdutoQuimicoDto } from './ProdutoQuimico.request.dtos.js';

async function camposInvalidos(dados: Record<string, unknown>) {
  const erros = await validate(
    plainToInstance(CreateOrUpdateProdutoQuimicoDto, {
      numeroONU: '1090',
      ...dados,
    }),
  );
  return erros.map((erro) => erro.property);
}

describe('validação do cadastro de produto químico', () => {
  it.each(['1090', '0004', '3082'])(
    'aceita número ONU %s preservando zeros à esquerda',
    async (numeroONU) => {
      expect(
        await camposInvalidos({ nome: 'Produto', classeRisco: 3, numeroONU }),
      ).toEqual([]);
      expect(
        plainToInstance(CreateOrUpdateProdutoQuimicoDto, { numeroONU })
          .numeroONU,
      ).toBe(numeroONU);
    },
  );

  it.each([
    undefined,
    null,
    '',
    '0000',
    '123',
    '12345',
    'UN1090',
    'UN 1090',
    '10.9',
    '+109',
    '-109',
    '1e03',
    ' 1090',
    '1090 ',
    '1090\n',
    '１０９０',
    1090,
  ])('recusa número ONU inválido %j', async (numeroONU) => {
    expect(
      await camposInvalidos({ nome: 'Produto', classeRisco: 3, numeroONU }),
    ).toContain('numeroONU');
  });

  it('aceita produto válido', async () => {
    expect(await camposInvalidos({ nome: 'Acetona', classeRisco: 3 })).toEqual(
      [],
    );
  });

  it('recusa produto sem nome', async () => {
    expect(await camposInvalidos({ classeRisco: 3 })).toContain('nome');
  });

  it('recusa produto sem classe de risco', async () => {
    expect(await camposInvalidos({ nome: 'Acetona' })).toContain('classeRisco');
  });

  it.each([0, 10])('recusa classe de risco %s', async (classeRisco) => {
    expect(await camposInvalidos({ nome: 'Acetona', classeRisco })).toContain(
      'classeRisco',
    );
  });

  it('recusa classe de risco fracionária', async () => {
    expect(
      await camposInvalidos({ nome: 'Acetona', classeRisco: 3.5 }),
    ).toContain('classeRisco');
  });

  it('aceita descrição e status opcionais quando ausentes', async () => {
    expect(await camposInvalidos({ nome: 'Acetona', classeRisco: 3 })).toEqual(
      [],
    );
  });

  it('recusa status que não seja booleano', async () => {
    expect(
      await camposInvalidos({
        nome: 'Acetona',
        classeRisco: 3,
        status: 'ativo',
      }),
    ).toContain('status');
  });
});
