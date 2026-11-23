import { ApiAuthenticated, ApiErrors } from '../../../../swagger/contracts.js';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiParam,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserService } from '../../application/user.service.js';
import { UserPasswordResetDto } from '../dtos/user.request.dtos.js';
import { UserResponseDto } from '../dtos/user.response.dtos.js';
import { AllowedRoles } from '../../../decorators/allowed-roles.decorator.js';
import { RolesEnum } from '../../../enums/roles.enum.js';

@ApiTags('Usuários')
@Controller('users')
@AllowedRoles([RolesEnum.ADMINISTRADOR])
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get(':id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({ summary: 'Consultar usuário' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404)
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number,
  ): Promise<UserResponseDto> {
    return await this.service.findOne({ id });
  }

  @Patch('password/:id')
  @ApiAuthenticated()
  @ApiErrors(403)
  @ApiParam({ name: 'id', example: 1, type: 'integer' })
  @ApiOperation({
    summary: 'Reset de senha por ID',
    description: 'Acessível somente para ADMINISTRADORES',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrors(400, 404, 409)
  async resetPassword(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UserPasswordResetDto,
  ): Promise<UserResponseDto> {
    return await this.service.resetPassword({ id, body });
  }
}
