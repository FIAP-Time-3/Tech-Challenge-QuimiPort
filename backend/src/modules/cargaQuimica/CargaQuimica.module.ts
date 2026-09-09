import { Module } from '@nestjs/common';
import { CargaQuimicaController } from './CargaQuimica.controller.js';
import { CargaQuimicaService } from './CargaQuimica.service.js';
import { PrismaService } from '../../database/prisma.service.js';

@Module({
  controllers: [CargaQuimicaController],
  providers: [CargaQuimicaService, PrismaService],
})
export class CargaQuimicaModule {}
