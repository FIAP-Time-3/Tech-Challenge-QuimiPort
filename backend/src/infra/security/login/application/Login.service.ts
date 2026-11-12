import { randomUUID } from 'node:crypto';
import configurations from '../../../configurations/configurations.js';
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
      !user.status ||
      !(await PasswordService.compare({
        hash: user.password,
        password,
      }))
    ) {
      throw new UnauthorizedException('Login ou Senha incorreta');
    }

    return await this.issueTokens(user);
  }

  async refresh(body: RefreshRequestDto) {
    const { refresh_token } = body;

    let decodedToken;

    try {
      decodedToken = await this.jwt.verifyAsync(refresh_token);
    } catch {
      throw new UnauthorizedException('Token Invalido');
    }

    if (
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      decodedToken.token_use !== 'refresh' ||
      !Number.isSafeInteger(decodedToken.id) ||
      decodedToken.id <= 0
    ) {
      throw new UnauthorizedException('Token Invalido');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(decodedToken.id),
      },
    });

    if (!user || !user.status) {
      throw new UnauthorizedException('Token Invalido');
    }

    return await this.issueTokens(user);
  }

  private async issueTokens(user: {
    id: number;
    username: string;
    roles: string[];
  }) {
    const { accessTokenMinutes, refreshTokenMinutes } = configurations().jwt;
    const access_token = await this.jwt.signAsync(
      {
        id: user.id,
        username: user.username,
        roles: user.roles,
        token_use: 'access',
      },
      { expiresIn: accessTokenMinutes * 60, jwtid: randomUUID() },
    );
    const refresh_token = await this.jwt.signAsync(
      { id: user.id, token_use: 'refresh' },
      { expiresIn: refreshTokenMinutes * 60, jwtid: randomUUID() },
    );

    return plainToInstance(LoginResponseDto, { access_token, refresh_token });
  }
}
