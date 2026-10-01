import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import {
  LoginRequestDto,
  RefreshRequestDto,
} from '../infrastructure/dtos/login.request.dtos.js';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from '../infrastructure/dtos/login.response.dtos.js';
import { PasswordService } from '../../password/password.service.js';

@Injectable()
export class LoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(body: LoginRequestDto) {
    const { password, username } = body;

    const user = await this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });

    if (
      !user ||
      !(await PasswordService.compare({
        hash: user.password,
        password,
      }))
    ) {
      throw new UnauthorizedException('Login ou Senha incorreta');
    }

    const { id, roles } = user;

    const access_token = await this.jwt.signAsync({
      id,
      username: user.username,
      roles,
    });

    const refresh_token = await this.jwt.signAsync(
      {
        id,
      },
      {
        expiresIn: '7d',
      },
    );

    return plainToInstance(LoginResponseDto, {
      access_token,
      refresh_token,
    });
  }

  async refresh(body: RefreshRequestDto) {
    const { refresh_token } = body;

    let decodedToken;

    try {
      decodedToken = await this.jwt.verifyAsync(refresh_token);
    } catch {
      throw new UnauthorizedException('Token Invalido');
    }

    if (!decodedToken || typeof decodedToken !== 'object' || !decodedToken.id) {
      throw new UnauthorizedException('Token Invalido');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(decodedToken.id),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token Invalido');
    }

    const { id, username, roles } = user;

    const access_token = await this.jwt.signAsync({
      id,
      username,
      roles,
    });

    const new_refresh_token = await this.jwt.signAsync(
      {
        id,
      },
      {
        expiresIn: '7d',
      },
    );

    return plainToInstance(LoginResponseDto, {
      access_token,
      refresh_token: new_refresh_token,
    });
  }
}
