import { Test, TestingModule } from '@nestjs/testing';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { StatusCargaEnum } from '../../domain/value-objects/StatusCarga.enum.js';
import { TipoDocumentoEnum } from '../../domain/value-objects/TipoDocumento.enum.js';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { CargaQuimicaController } from './CargaQuimica.controller.js';

describe('CargaQuimicaController', () => {
  let controller: CargaQuimicaController;
  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    historico: vi.fn(),
    update: vi.fn(),
    transicionar: vi.fn(),
    bloquear: vi.fn(),
    liberar: vi.fn(),
    cancelar: vi.fn(),
    adicionarDocumento: vi.fn(),
    validarDocumento: vi.fn(),
  };
  const body = {
    produtoQuimicoId: 1,
    quantidade: 100,
    unidadeMedida: 'kg',
    origem: 'Rotterdam',
    destino: 'Santos',
    responsavelTecnico: 'Maria Souza',
  };
  const req = { user: { id: 8, roles: [RolesEnum.ADMINISTRADOR] } };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargaQuimicaController],
      providers: [{ provide: CargaQuimicaService, useValue: serviceMock }],
    }).compile();

    controller = module.get(CargaQuimicaController);
  });

  it('encaminha body e usuário ao criar carga', async () => {
    const result = { id: 10 };
    serviceMock.create.mockResolvedValue(result);

    await expect(controller.create(body, req)).resolves.toBe(result);
    expect(serviceMock.create).toHaveBeenCalledWith({
      body,
      usuario: req.user,
    });
  });

  it('encaminha listagem ao serviço', async () => {
    serviceMock.findAll.mockResolvedValue([]);

    await expect(controller.findAll()).resolves.toEqual([]);
    expect(serviceMock.findAll).toHaveBeenCalledOnce();
  });

  it('encaminha id para busca da carga e do histórico', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 10 });
    serviceMock.historico.mockResolvedValue([]);

    await expect(controller.findOne(10)).resolves.toEqual({ id: 10 });
    await expect(controller.historico(10)).resolves.toEqual([]);
    expect(serviceMock.findOne).toHaveBeenCalledWith({ id: 10 });
    expect(serviceMock.historico).toHaveBeenCalledWith({ id: 10 });
  });

  it('encaminha id e dados ao atualizar carga', async () => {
    serviceMock.update.mockResolvedValue({ id: 10 });

    await expect(controller.update(10, body)).resolves.toEqual({ id: 10 });
    expect(serviceMock.update).toHaveBeenCalledWith({ id: 10, body });
  });

  it('encaminha status, motivo e usuário ao atualizar etapa', async () => {
    const statusBody = {
      statusCarga: StatusCargaEnum.EM_PREPARACAO,
      motivo: 'Aprovada',
    };
    serviceMock.transicionar.mockResolvedValue({ id: 10 });

    await expect(
      controller.atualizarStatus(10, statusBody, req),
    ).resolves.toEqual({ id: 10 });
    expect(serviceMock.transicionar).toHaveBeenCalledWith({
      id: 10,
      statusDestino: statusBody.statusCarga,
      motivo: statusBody.motivo,
      usuario: req.user,
    });
  });

  it('encaminha bloqueio e cancelamento com usuário e motivo', async () => {
    const motivo = { motivo: 'Documentação inconsistente' };
    serviceMock.bloquear.mockResolvedValue({ id: 10 });
    serviceMock.cancelar.mockResolvedValue({ id: 10 });

    await controller.bloquear(10, motivo, req);
    await controller.cancelar(10, motivo, req);

    expect(serviceMock.bloquear).toHaveBeenCalledWith({
      id: 10,
      motivo: motivo.motivo,
      usuario: req.user,
    });
    expect(serviceMock.cancelar).toHaveBeenCalledWith({
      id: 10,
      motivo: motivo.motivo,
      usuario: req.user,
    });
  });

  it('encaminha liberação com usuário', async () => {
    serviceMock.liberar.mockResolvedValue({ id: 10 });

    await controller.liberar(10, req);

    expect(serviceMock.liberar).toHaveBeenCalledWith({
      id: 10,
      usuario: req.user,
    });
  });

  it('encaminha registro e validação de documentos', async () => {
    const documentBody = { tipoDocumento: TipoDocumentoEnum.FISPQ };
    serviceMock.adicionarDocumento.mockResolvedValue({ id: 3 });
    serviceMock.validarDocumento.mockResolvedValue({ id: 3, validado: true });

    await expect(
      controller.adicionarDocumento(10, documentBody),
    ).resolves.toEqual({ id: 3 });
    await expect(controller.validarDocumento(10, 3)).resolves.toEqual({
      id: 3,
      validado: true,
    });
    expect(serviceMock.adicionarDocumento).toHaveBeenCalledWith({
      id: 10,
      tipoDocumento: TipoDocumentoEnum.FISPQ,
    });
    expect(serviceMock.validarDocumento).toHaveBeenCalledWith({
      id: 10,
      docId: 3,
    });
  });
});
