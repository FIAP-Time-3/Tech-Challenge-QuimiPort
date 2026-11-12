import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SetupResponseDto } from '../dtos/login.response.dtos.js';
import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  LoginRequestDto,
  RefreshRequestDto,
} from '../dtos/login.request.dtos.js';
import { SetPublic } from '../../../decorators/setPublic.decorator.js';
import { LoginService } from '../../application/Login.service.js';

@SetPublic()
@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Get('setup')
  @ApiOperation({ summary: 'Consultar necessidade de configuração inicial' })
  @ApiOkResponse({ type: SetupResponseDto })
  async getSetup(): Promise<SetupResponseDto> {
    return await this.loginService.getSetup();
  }

  @Post()
  async login(@Body() body: LoginRequestDto) {
    return await this.loginService.login(body);
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshRequestDto) {
    return await this.loginService.refresh(body);
  }
}
