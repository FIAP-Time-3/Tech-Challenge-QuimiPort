import { Module } from '@nestjs/common';
import { ProdutoQuimicoController } from './ProdutoQuimico.controller.js';
import { ProdutoQuimicoService } from './ProdutoQuimico.service.js';

@Module({
  controllers: [ProdutoQuimicoController],
  providers: [ProdutoQuimicoService],
})
export class ProdutoQuimicoModule {}
