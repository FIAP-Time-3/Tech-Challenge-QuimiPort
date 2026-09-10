import { Module } from '@nestjs/common';
import { ProdutoQuimicoController } from './infrastructure/controller/ProdutoQuimico.controller.js';
import { ProdutoQuimicoService } from './application/ProdutoQuimico.service.js';
import { PrismaService } from '../../infra/database/prisma.service.js';

@Module({
  controllers: [ProdutoQuimicoController],
  providers: [ProdutoQuimicoService, PrismaService],
})
export class ProdutoQuimicoModule {}
