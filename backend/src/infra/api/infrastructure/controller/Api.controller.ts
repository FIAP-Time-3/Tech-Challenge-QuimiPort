import { Controller, Get, Param } from '@nestjs/common';
import { SetPublic } from '../../../security/decorators/setPublic.decorator.js';
import { ApiService } from '../../application/Api.service.js';

@SetPublic()
@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('public/:file')
  async getPublicFile(@Param('file') filename: string) {
    return await this.apiService.getPublicFile({ filename });
  }
}
