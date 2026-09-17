import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { AllowedRoles } from '../security/decorators/allowedRoles.decorator.js';
import { RolesEnum } from '../security/enums/roles.enum.js';

@Controller('health')
@AllowedRoles([RolesEnum.ADMINISTRADOR])
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
