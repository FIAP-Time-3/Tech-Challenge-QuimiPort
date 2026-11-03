import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { SetPublic } from '../security/decorators/setPublic.decorator.js';

@Controller('health')
@SetPublic()
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  async getHealth() {
    return await this.service.getHealth();
  }

  @Get('db')
  async getDbHealth() {
    return await this.service.getDbHealth();
  }
}
