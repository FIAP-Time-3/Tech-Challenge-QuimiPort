import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusCargaEnum } from '../../domain/value-objects/StatusCarga.enum.js';
import { TipoDocumentoEnum } from '../../domain/value-objects/TipoDocumento.enum.js';
import {
  CreateDocumentoDto,
  CreateOrUpdateCargaQuimicaDto,
  MotivoDto,
  UpdateStatusDto,
} from './CargaQuimica.request.dtos.js';

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

  it('aceita data de entrada opcional no formato Date', async () => {
    const errors = await validate(
      plainToInstance(CreateOrUpdateCargaQuimicaDto, {
        ...valido,
        dataEntrada: '2026-10-31T12:00:00.000Z',
      }),
    );

    expect(errors.map((error) => error.property)).toEqual([]);
  });

  it('recusa data de entrada inválida', async () => {
    const errors = await validate(
      plainToInstance(CreateOrUpdateCargaQuimicaDto, {
        ...valido,
        dataEntrada: 'not-a-date',
      }),
    );

    expect(errors.map((error) => error.property)).toContain('dataEntrada');
  });
});

describe('validação dos DTOs de movimentação e documentos', () => {
  it('aceita status válido e motivo opcional', async () => {
    const errors = await validate(
      plainToInstance(UpdateStatusDto, {
        statusCarga: StatusCargaEnum.EM_PREPARACAO,
      }),
    );

    expect(errors.map((error) => error.property)).toEqual([]);
  });

  it('recusa status fora do fluxo conhecido', async () => {
    const errors = await validate(
      plainToInstance(UpdateStatusDto, { statusCarga: 'INVALIDO' }),
    );

    expect(errors.map((error) => error.property)).toContain('statusCarga');
  });

  it('aceita motivo e tipo de documento válidos', async () => {
    const motivoErrors = await validate(
      plainToInstance(MotivoDto, { motivo: 'Ajuste documental' }),
    );
    const documentErrors = await validate(
      plainToInstance(CreateDocumentoDto, {
        tipoDocumento: TipoDocumentoEnum.FISPQ,
      }),
    );

    expect(motivoErrors).toEqual([]);
    expect(documentErrors).toEqual([]);
  });

  it('recusa motivo vazio e tipo de documento desconhecido', async () => {
    const motivoErrors = await validate(
      plainToInstance(MotivoDto, { motivo: '' }),
    );
    const documentErrors = await validate(
      plainToInstance(CreateDocumentoDto, { tipoDocumento: 'UNKNOWN' }),
    );

    expect(motivoErrors.map((error) => error.property)).toContain('motivo');
    expect(documentErrors.map((error) => error.property)).toContain(
      'tipoDocumento',
    );
  });
});
