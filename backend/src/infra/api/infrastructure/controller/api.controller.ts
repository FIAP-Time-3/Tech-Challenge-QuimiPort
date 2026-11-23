import { ApiErrors } from '../../../swagger/contracts.js';
import { Controller, Get, Param } from '@nestjs/common';
import { SetPublic } from '../../../security/decorators/set-public.decorator.js';
import { ApiService } from '../../application/api.service.js';
import {
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('Arquivos públicos')
@SetPublic()
@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @ApiOperation({
    summary: 'Baixar arquivo JSON público',
    security: [],
    description:
      'openapi.json contém a especificação OpenAPI. collection.json é um alias legado do mesmo formato, não uma coleção Postman.',
  })
  @ApiOkResponse({
    content: {
      'application/json': {
        schema: { type: 'object', additionalProperties: true },
      },
    },
  })
  @ApiErrors(404)
  @Get('public/:file')
  @ApiParam({ name: 'file', example: 'openapi.json' })
  async getPublicFile(
    @Param('file')
    filename: string,
  ) {
    return await this.apiService.getPublicFile({ filename });
  }
}
