import { Controller, Get, Param } from '@nestjs/common';
import { SetPublic } from '../../../security/decorators/setPublic.decorator.js';
import { ApiService } from '../../application/Api.service.js';
import { ApiParam } from '@nestjs/swagger';

@SetPublic()
@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('public/:file')
  @ApiParam({ name: 'file', example: 'collection.json' })
  async getPublicFile(
    @Param('file')
    filename: string,
  ) {
    return await this.apiService.getPublicFile({ filename });
  }
}
