import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../../application/User.service.js';
import { UserResponseDto } from '../dtos/User.response.dtos.js';

@Controller('me')
export class MeController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar os dados do usuário autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(
    @Req() request: { user: { id: number } },
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id: request.user.id });
  }
}
