import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
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
