import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
} from '@nestjs/swagger';

export class IdResponseDto {
  @ApiProperty({ type: 'integer', example: 1 })
  id: number;
}

export class ErrorResponseDto {
  @ApiProperty({ type: 'integer', example: 400 })
  statusCode: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: string;

  @ApiPropertyOptional({ example: 'ACCESS_TOKEN_EXPIRED' })
  code?: string;
}

const descriptions: Record<number, string> = {
  400: 'Dados inválidos ou regra de negócio não atendida.',
  401: 'Credenciais/token inválidos, expirados ou usuário inativo.',
  403: 'Perfil sem permissão ou operação proibida.',
  404: 'Recurso não encontrado.',
  409: 'Informação duplicada ou conflito com o estado atual.',
  412: 'Nenhum usuário ativo; é necessário realizar o primeiro acesso.',
  413: 'Arquivo maior que o limite de 10 MiB.',
};

export function ApiErrors(...statuses: number[]) {
  return applyDecorators(
    ...statuses.map((status) =>
      ApiResponse({
        status,
        description: descriptions[status],
        type: ErrorResponseDto,
      }),
    ),
  );
}

export function ApiAuthenticated() {
  return applyDecorators(ApiBearerAuth('jwt'), ApiErrors(401, 412));
}
