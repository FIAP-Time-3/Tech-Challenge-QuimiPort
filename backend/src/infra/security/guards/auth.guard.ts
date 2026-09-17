import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<any> {
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

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return false;
    }

    const data = await this.jwtService.decode(token);
    // valida se é ativo
    // valida se usuário existe no banco
    req.user = data;
    return true;
  }
}
