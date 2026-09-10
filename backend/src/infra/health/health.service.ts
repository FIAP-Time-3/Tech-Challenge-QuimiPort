import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const { database } = await this.getDbHealth();

    return {
      api: 'ok',
      status: database ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      services: { database: database },
    };
  }

  async getDbHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: true };
    } catch {
      return { database: false };
    }
  }

  private getUptime() {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
  }
}
