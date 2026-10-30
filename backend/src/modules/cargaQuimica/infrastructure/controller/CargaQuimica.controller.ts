import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedRoles } from '../../../../infra/security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { type UsuarioLogado } from '../../application/CargaQuimica.permissoes.js';
import {
  CreateDocumentoDto,
  CreateOrUpdateCargaQuimicaDto,
  MotivoDto,
  UpdateStatusDto,
} from '../dtos/CargaQuimica.request.dtos.js';
import {
  CargaQuimicaResponseDto,
  DocumentoResponseDto,
  MovimentacaoResponseDto,
} from '../dtos/CargaQuimica.response.dtos.js';

interface RequisicaoAutenticada {
  user: UsuarioLogado;
}

const PERFIS_CADASTRO = [
  RolesEnum.ADMINISTRADOR,
  RolesEnum.GESTOR,
  RolesEnum.OPERADOR,
];
const PERFIS_CANCELAMENTO = [RolesEnum.ADMINISTRADOR, RolesEnum.GESTOR];
const PERFIS_ANEXAR_DOCUMENTO = [
  RolesEnum.ADMINISTRADOR,
  RolesEnum.GESTOR,
  RolesEnum.TECNICO,
  RolesEnum.DOCUMENTACAO,
];
const PERFIS_VALIDAR_DOCUMENTO = [
  RolesEnum.ADMINISTRADOR,
  RolesEnum.GESTOR,
  RolesEnum.QUALIDADE,
  RolesEnum.INSPETOR,
];

@ApiTags('Cargas químicas')
@Controller('cargas-quimicas')
export class CargaQuimicaController {
  constructor(private readonly service: CargaQuimicaService) {}

  @AllowedRoles(PERFIS_CADASTRO)
  @ApiOperation({
    summary: 'Registrar carga química',
    description:
      'Cria a carga em CADASTRADA, herda a classe de risco do produto e registra a movimentação step 1. Exige produto ativo, quantidade > 0 e responsável técnico.',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, produto inexistente ou inativo',
  })
  @Post()
  async create(
    @Body() body: CreateOrUpdateCargaQuimicaDto,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.create({ body, usuario: req.user });
  }

  @ApiOperation({ summary: 'Listar cargas químicas' })
  @Get()
  async findAll(): Promise<CargaQuimicaResponseDto[]> {
    return await this.service.findAll();
  }

  @ApiOperation({ summary: 'Buscar carga química por id' })
  @ApiNotFoundResponse({ description: 'Carga não encontrada' })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.findOne({ id });
  }

  @ApiOperation({
    summary: 'Consultar histórico de movimentações',
    description: 'Retorna as movimentações ordenadas por step.',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Get(':id/historico')
  async historico(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<MovimentacaoResponseDto[]> {
    return await this.service.historico({ id });
  }

  @AllowedRoles(PERFIS_CADASTRO)
  @ApiOperation({
    summary: 'Atualizar dados da carga (sem mudar o status)',
    description:
      'O produto só pode ser trocado em CADASTRADA. Cargas FINALIZADA ou CANCELADA não podem ser alteradas.',
  })
  @ApiConflictResponse({
    description: 'Alteração não permitida no status atual',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateOrUpdateCargaQuimicaDto,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.update({ id, body });
  }

  @ApiOperation({
    summary: 'Atualizar status da carga',
    description:
      'Valida a transição pela matriz de status, o perfil do usuário na etapa, o motivo (bloquear e cancelar) e a documentação (liberar). Registra uma movimentação.',
  })
  @ApiBadRequestResponse({ description: 'Motivo obrigatório ausente' })
  @ApiForbiddenResponse({ description: 'Perfil sem permissão na etapa' })
  @ApiConflictResponse({
    description: 'Transição inválida ou documentação pendente',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Patch(':id/status')
  async atualizarStatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateStatusDto,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.transicionar({
      id,
      statusDestino: body.statusCarga,
      motivo: body.motivo,
      usuario: req.user,
    });
  }

  @ApiOperation({
    summary: 'Bloquear carga (a partir de EM_INSPECAO)',
    description: 'Exige motivo.',
  })
  @ApiBadRequestResponse({ description: 'Motivo ausente' })
  @ApiConflictResponse({ description: 'Transição inválida' })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Patch(':id/bloquear')
  async bloquear(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: MotivoDto,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.bloquear({
      id,
      motivo: body.motivo,
      usuario: req.user,
    });
  }

  @ApiOperation({
    summary: 'Liberar carga (a partir de EM_INSPECAO)',
    description:
      'Exige todos os documentos obrigatórios registrados e validados.',
  })
  @ApiConflictResponse({
    description: 'Transição inválida ou documentação pendente',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Patch(':id/liberar')
  async liberar(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.liberar({ id, usuario: req.user });
  }

  @AllowedRoles(PERFIS_CANCELAMENTO)
  @ApiOperation({
    summary: 'Cancelar carga (cancelamento lógico)',
    description:
      'Mantém o registro e o histórico. Exige motivo. Cargas FINALIZADA ou CANCELADA não podem ser canceladas.',
  })
  @ApiBadRequestResponse({ description: 'Motivo ausente' })
  @ApiConflictResponse({ description: 'Carga em estado terminal' })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Patch(':id/cancelar')
  async cancelar(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: MotivoDto,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.cancelar({
      id,
      motivo: body.motivo,
      usuario: req.user,
    });
  }

  @AllowedRoles(PERFIS_ANEXAR_DOCUMENTO)
  @ApiOperation({ summary: 'Registrar documento da carga' })
  @ApiConflictResponse({
    description: 'Documento já registrado ou carga encerrada',
  })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @Post(':id/documentos')
  async adicionarDocumento(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateDocumentoDto,
  ): Promise<DocumentoResponseDto> {
    return await this.service.adicionarDocumento({
      id,
      tipoDocumento: body.tipoDocumento,
    });
  }

  @AllowedRoles(PERFIS_VALIDAR_DOCUMENTO)
  @ApiOperation({ summary: 'Validar documento da carga' })
  @ApiNotFoundResponse({ description: 'Carga ou documento não encontrado' })
  @ApiParam({ name: 'id', example: 1, type: Number })
  @ApiParam({ name: 'docId', example: 1, type: Number })
  @Patch(':id/documentos/:docId/validar')
  async validarDocumento(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('docId', new ParseIntPipe()) docId: number,
  ): Promise<DocumentoResponseDto> {
    return await this.service.validarDocumento({ id, docId });
  }
}
