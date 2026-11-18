import { ApiErrors } from '../../../../swagger/contracts.js';
import {
  ApiOkResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SetupResponseDto,
  LoginResponseDto,
} from '../dtos/login.response.dtos.js';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  LoginRequestDto,
  RefreshRequestDto,
} from '../dtos/login.request.dtos.js';
import { SetPublic } from '../../../decorators/setPublic.decorator.js';
import { LoginService } from '../../application/Login.service.js';

@ApiTags('Autenticação')
@SetPublic()
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get('setup')
  @ApiOperation({
    summary: 'Consultar necessidade de configuração inicial',
    security: [],
  })
  @ApiOkResponse({ type: SetupResponseDto })
  async getSetup(): Promise<SetupResponseDto> {
    return await this.loginService.getSetup();
  }

  @ApiOperation({ summary: 'Autenticar com email e senha', security: [] })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiErrors(400, 401)
  @Post()
  async login(@Body() body: LoginRequestDto) {
    return await this.loginService.login(body);
  }

  @ApiOperation({
    summary: 'Renovar os tokens',
    security: [],
    description:
      'Recebe apenas refresh_token; não requer Bearer. Tokens de acesso não são aceitos como refresh.',
  })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiErrors(400, 401)
  @Post('refresh')
  async refresh(@Body() body: RefreshRequestDto) {
    return await this.loginService.refresh(body);
  }
}
