import { Module } from '@nestjs/common';
import { ProdutoQuimicoController } from './ProdutoQuimico.controller.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';
import { PrismaService } from '../../database/prisma.service.js';

@Module({
  controllers: [ProdutoQuimicoController],
  providers: [ProdutoQuimicoService, PrismaService],
})
export class ProdutoQuimicoModule {}
