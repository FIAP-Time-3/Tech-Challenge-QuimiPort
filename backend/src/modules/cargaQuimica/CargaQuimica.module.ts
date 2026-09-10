import { Module } from '@nestjs/common';
import { CargaQuimicaController } from './infrastructure/controller/CargaQuimica.controller.js';
import { CargaQuimicaService } from './application/CargaQuimica.service.js';
import { PrismaService } from '../../infra/database/prisma.service.js';

@Module({
  controllers: [CargaQuimicaController],
  providers: [CargaQuimicaService, PrismaService],
})
export class CargaQuimicaModule {}
