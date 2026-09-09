import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/configuration.module.js';
import { CargaQuimicaModule } from './modules/cargaQuimica/CargaQuimica.module.js';
import { ProdutoQuimicoModule } from './modules/produtoQuimico/ProdutoQuimico.module.js';

@Module({
  imports: [ConfigModule, CargaQuimicaModule, ProdutoQuimicoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
