import { Module } from '@nestjs/common';
import { ConfigModule as Config } from '@nestjs/config';
import configuration from './configurations.js';

@Module({
  imports: [
    Config.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
  ],
})
export class ConfigsModule {}
