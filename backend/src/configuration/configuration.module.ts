import { Module } from '@nestjs/common';
import { ConfigModule as Config } from '@nestjs/config';
import configuration from './configuration.js';

@Module({
  imports: [
    Config.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
