import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigsModule } from './infra/configurations/configurations.module.js';
import { CargaQuimicaModule } from './modules/carga-quimica/carga-quimica.module.js';
import { ProdutoQuimicoModule } from './modules/produto-quimico/produto-quimico.module.js';
import { LoggerMiddleware } from './infra/logger/logger.middleware.js';
import { HealthModule } from './infra/health/health.module.js';
import { SecurityModule } from './infra/security/security.module.js';
import { ApiModule } from './infra/api/api.module.js';

@Module({
  imports: [
    ApiModule,
    SecurityModule,
    HealthModule,
    ConfigsModule,
    CargaQuimicaModule,
    ProdutoQuimicoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
