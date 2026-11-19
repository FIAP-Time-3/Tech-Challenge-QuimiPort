import { Module } from '@nestjs/common';
import { ApiService } from './application/api.service.js';
import { ApiController } from './infrastructure/controller/api.controller.js';

@Module({
  providers: [ApiService],
  controllers: [ApiController],
})
export class ApiModule {}
