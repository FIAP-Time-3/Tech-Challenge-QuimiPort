import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RolesEnum } from '../enums/roles.enum.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const rolesContextHandler =
      this.reflector.get<RolesEnum[]>('roles', context.getHandler()) ?? [];

    const rolesContextClass =
      this.reflector.get<RolesEnum[]>('roles', context.getClass()) ?? [];

    const rolesAllowed = [
      ...new Set([rolesContextHandler, rolesContextClass].flat()),
    ];

    if (rolesAllowed.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    for (const role of user.roles) {
      if (rolesAllowed.includes(role)) {
        return true;
      }
    }

    return false;
  }
}
