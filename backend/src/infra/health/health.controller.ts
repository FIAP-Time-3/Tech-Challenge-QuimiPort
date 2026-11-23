import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import {
  DatabaseHealthResponseDto,
  HealthResponseDto,
} from './health.response.dtos.js';
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { SetPublic } from '../security/decorators/set-public.decorator.js';

@ApiTags('Saúde')
@Controller('health')
@SetPublic()
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @ApiOperation({
    summary: 'Consultar saúde da API',
    security: [],
    description: 'Retorna HTTP 200 também quando status é degraded.',
  })
  @ApiOkResponse({ type: HealthResponseDto })
  @Get()
  async getHealth() {
    return await this.service.getHealth();
  }

  @ApiOperation({
    summary: 'Consultar conectividade com o banco',
    security: [],
    description: 'Retorna HTTP 200 com database true ou false.',
  })
  @ApiOkResponse({ type: DatabaseHealthResponseDto })
  @Get('db')
  async getDbHealth() {
    return await this.service.getDbHealth();
  }
}
