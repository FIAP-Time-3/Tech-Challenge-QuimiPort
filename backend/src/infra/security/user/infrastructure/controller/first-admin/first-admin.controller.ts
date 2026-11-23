import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrors } from '../../../../../swagger/contracts.js';
import { SetPublic } from '../../../../decorators/set-public.decorator.js';
import { UserResponseDto } from '../../../infrastructure/dtos/user.response.dtos.js';
import { UserService } from '../../../application/user.service.js';
import { CreateFirstUserDto } from '../../dtos/user.request.dtos.js';

@ApiTags('Usuários')
@Controller('users/first_access')
@SetPublic()
export class FirstAdminController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({
    summary: 'Criar o administrador inicial',
    security: [],
    description:
      'Cadastro público permitido somente enquanto não existir administrador ativo.',
  })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiErrors(400, 403, 409)
  @Post()
  async createFirstAdmin(
    @Body() body: CreateFirstUserDto,
  ): Promise<UserResponseDto> {
    return await this.service.createFirst({
      body,
    });
  }
}
