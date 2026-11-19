import { ApiAuthenticated, ApiErrors } from '../../../../swagger/contracts.js';
import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../application/user.service.js';
import { UserResponseDto } from '../dtos/user.response.dtos.js';
import { UserPasswordChangeDto } from '../dtos/user.request.dtos.js';

@ApiTags('Usuários')
@Controller('me')
export class MeController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiAuthenticated()
  @ApiErrors(404)
  @ApiOperation({ summary: 'Consultar os dados do usuário autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(
    @Req() request: { user: { id: number } },
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id: request.user.id });
  }

  @Patch('password')
  @ApiAuthenticated()
  @ApiErrors(404)
  @ApiOperation({ summary: 'Alterar senha de usuário utilizando Token' })
  @ApiOkResponse({ type: UserResponseDto })
  async changePassword(
    @Req() request: { user: { id: number } },
    @Body() body: UserPasswordChangeDto,
  ): Promise<UserResponseDto> {
    return await this.service.changePassword({ id: request.user.id, body });
  }
}
