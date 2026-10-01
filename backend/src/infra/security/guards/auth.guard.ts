import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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

      req.user = data;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}