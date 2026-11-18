import {
  ApiAuthenticated,
  ApiErrors,
  ApiPaginatedOkResponse,
} from '../../../../infra/swagger/contracts.js';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedRoles } from '../../../../infra/security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../../../../infra/security/enums/roles.enum.js';
import { CargaQuimicaService } from '../../application/CargaQuimica.service.js';
import { type UsuarioLogado } from '../../application/CargaQuimica.permissoes.js';
import { TipoDocumentoEnum } from '../../domain/value-objects/TipoDocumento.enum.js';
import { StatusCargaEnum } from '../../domain/value-objects/StatusCarga.enum.js';
import { transicoes } from '../../domain/CargaQuimica.transicoes.js';
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
import { PaginatedSortQueryDto } from '../../../../infra/paginatedSort/paginated-sort.query.dtos.js';
import { PaginatedResponseDto } from '../../../../infra/paginatedSort/pagination/paginated.response.dtos.js';

interface RequisicaoAutenticada {
  user: UsuarioLogado;
}

interface ArquivoPdfUpload {
  buffer: Buffer;
}

const PERFIS_CADASTRO = [RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR];
const PERFIS_CANCELAMENTO = [RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR];
const PERFIS_ANEXAR_DOCUMENTO = [RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR];
const PERFIS_VALIDAR_DOCUMENTO = [RolesEnum.ADMINISTRADOR, RolesEnum.OPERADOR];

@ApiAuthenticated()
@ApiErrors(403)
@ApiTags('Cargas químicas')
@Controller('cargas-quimicas')
export class CargaQuimicaController {
  constructor(private readonly service: CargaQuimicaService) {}

  @Get('transicoes/:status')
  @ApiOperation({
    summary: 'Consultar transições permitidas por status',
    description:
      'Retorna os próximos status previstos na matriz de transições. Não considera o perfil do usuário nem a documentação da carga. Status terminais retornam uma lista vazia.',
  })
  @ApiParam({ name: 'status', enum: StatusCargaEnum })
  @ApiOkResponse({
    description:
      'Lista de próximos status permitidos pela matriz de transições',
    schema: {
      type: 'array',
      items: { type: 'string', enum: Object.values(StatusCargaEnum) },
      example: [StatusCargaEnum.EM_PREPARACAO, StatusCargaEnum.CANCELADA],
    },
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, status inexistente',
  })
  transicoes(
    @Param('status', new ParseEnumPipe(StatusCargaEnum))
    status: StatusCargaEnum,
  ): readonly StatusCargaEnum[] {
    return transicoes[status];
  }

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
  @ApiCreatedResponse({ type: CargaQuimicaResponseDto })
  async create(
    @Body() body: CreateOrUpdateCargaQuimicaDto,
    @Req() req: RequisicaoAutenticada,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.create({ body, usuario: req.user });
  }

  @ApiOperation({ summary: 'Listar cargas químicas' })
  @Get()
  @ApiPaginatedOkResponse(CargaQuimicaResponseDto)
  async findAll(
    @Query() paginatedSort: PaginatedSortQueryDto,
  ): Promise<PaginatedResponseDto<CargaQuimicaResponseDto>> {
    return await this.service.findAll({ paginatedSort });
  }

  @ApiOperation({ summary: 'Buscar carga química por id' })
  @ApiNotFoundResponse({ description: 'Carga não encontrada' })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Get(':id')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<CargaQuimicaResponseDto> {
    return await this.service.findOne({ id });
  }

  @ApiOperation({
    summary: 'Consultar histórico de movimentações',
    description: 'Retorna as movimentações ordenadas por step.',
  })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Get(':id/historico')
  @ApiPaginatedOkResponse(MovimentacaoResponseDto)
  @ApiErrors(400, 404)
  async historico(
    @Param('id', new ParseIntPipe()) id: number,
    @Query() paginatedSort: PaginatedSortQueryDto,
  ): Promise<PaginatedResponseDto<MovimentacaoResponseDto>> {
    return await this.service.historico({ id, paginatedSort });
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
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Put(':id')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
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
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Patch(':id/status')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
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
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Patch(':id/bloquear')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
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
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Patch(':id/liberar')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
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
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @Patch(':id/cancelar')
  @ApiOkResponse({ type: CargaQuimicaResponseDto })
  @ApiErrors(400, 404)
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
  @ApiOperation({
    summary: 'Registrar documento da carga',
    description: 'Upload multipart: arquivo PDF obrigatório, limite de 10 MiB.',
  })
  @ApiConflictResponse({
    description: 'Documento já registrado ou carga encerrada',
  })
  @ApiBadRequestResponse({
    description: 'Arquivo ausente ou conteúdo não é um PDF válido',
  })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tipoDocumento', 'arquivo'],
      properties: {
        tipoDocumento: {
          type: 'string',
          enum: Object.values(TipoDocumentoEnum),
        },
        arquivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post(':id/documentos')
  @UseInterceptors(
    FileInterceptor('arquivo', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  @ApiCreatedResponse({ type: DocumentoResponseDto })
  @ApiErrors(404, 413)
  async adicionarDocumento(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: CreateDocumentoDto,
    @UploadedFile() arquivo?: ArquivoPdfUpload,
  ): Promise<DocumentoResponseDto> {
    if (!arquivo) {
      throw new BadRequestException('O arquivo PDF é obrigatório.');
    }
    if (!arquivo.buffer.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
      throw new BadRequestException(
        'O arquivo enviado deve ser um PDF válido.',
      );
    }

    return await this.service.adicionarDocumento({
      id,
      tipoDocumento: body.tipoDocumento,
      arquivo: arquivo.buffer,
    });
  }

  @ApiOperation({ summary: 'Baixar documento da carga' })
  @ApiNotFoundResponse({
    description: 'Carga ou arquivo do documento não encontrado',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Arquivo PDF do documento',
    content: {
      'application/pdf': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiParam({ name: 'docId', example: 1, type: 'integer' })
  @Get(':id/documentos/:docId')
  @ApiErrors(400, 404)
  async obterArquivoDocumento(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('docId', new ParseIntPipe()) docId: number,
  ): Promise<StreamableFile> {
    const arquivo = await this.service.obterArquivoDocumento({ id, docId });
    return new StreamableFile(arquivo, {
      type: 'application/pdf',
      disposition: `attachment; filename="documento-${docId}.pdf"`,
    });
  }

  @AllowedRoles(PERFIS_VALIDAR_DOCUMENTO)
  @ApiOperation({ summary: 'Validar documento da carga' })
  @ApiNotFoundResponse({ description: 'Carga ou documento não encontrado' })
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiParam({ name: 'docId', example: 1, type: 'integer' })
  @Patch(':id/documentos/:docId/validar')
  @ApiOkResponse({ type: DocumentoResponseDto })
  @ApiErrors(400, 404)
  async validarDocumento(
    @Param('id', new ParseIntPipe()) id: number,
    @Param('docId', new ParseIntPipe()) docId: number,
  ): Promise<DocumentoResponseDto> {
    return await this.service.validarDocumento({ id, docId });
  }
}
