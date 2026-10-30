import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrUpdateProdutoQuimicoDto } from './ProdutoQuimico.request.dtos.js';

async function camposInvalidos(dados: Record<string, unknown>) {
  const erros = await validate(
    plainToInstance(CreateOrUpdateProdutoQuimicoDto, dados),
  );
  return erros.map((erro) => erro.property);
}

describe('validação do cadastro de produto químico', () => {
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
});
