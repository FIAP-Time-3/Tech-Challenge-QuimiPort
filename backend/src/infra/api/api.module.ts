import { Module } from '@nestjs/common';
import { ApiService } from './application/Api.service.js';
import { ApiController } from './infrastructure/controller/Api.controller.js';

@Module({
  providers: [ApiService],
  controllers: [ApiController],
})
export class ApiModule {}
