import { Module } from '@nestjs/common';
import { ConfigModule } from './configuration/configuration.module.js';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
