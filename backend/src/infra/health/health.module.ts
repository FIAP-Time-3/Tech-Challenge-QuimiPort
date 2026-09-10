import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';
import { PrismaService } from '../database/prisma.service.js';

@Module({
  imports: [],
  providers: [HealthService, PrismaService],
  controllers: [HealthController],
})
export class HealthModule {}
