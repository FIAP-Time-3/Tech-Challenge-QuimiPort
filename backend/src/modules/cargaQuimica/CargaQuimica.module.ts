import { Module } from '@nestjs/common';
import { CargaQuimicaController } from './CargaQuimica.controller.js';
import { CargaQuimicaService } from './CargaQuimica.service.js';

@Module({
  controllers: [CargaQuimicaController],
  providers: [CargaQuimicaService],
})
export class CargaQuimicaModule {}
