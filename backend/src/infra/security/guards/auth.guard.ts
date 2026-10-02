import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicContextHandler = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    const publicContextClass = this.reflector.get<boolean>(
      'isPublic',
      context.getClass(),
    );

    if (publicContextClass || publicContextHandler) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token não informado');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const data = await this.jwtService.verifyAsync(token);

      const user = await this.prisma.user.findFirst({ where: { id: data.id } });
      if (!user || !user.status) {
        throw new UnauthorizedException('Token inválido');
      }
      req.user = {
        id: user.id,
        username: user.username,
        roles: user.roles,
        iat: data.iat,
        exp: data.exp,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
