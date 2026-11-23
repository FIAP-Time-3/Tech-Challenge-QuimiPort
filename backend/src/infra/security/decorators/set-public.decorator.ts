// Use este decorator para marcar rota como publica
// Rotas Publicas não validam ROLE nem TOKEN

import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SetPublic = (): MethodDecorator & ClassDecorator => {
  return SetMetadata('isPublic', true);
};

export function isPublic({
  reflector,
  context,
}: {
  reflector: Reflector;
  context: ExecutionContext;
}) {
  const publicContextHandler = reflector.get<boolean>(
    'isPublic',
    context.getHandler(),
  );

  const publicContextClass = reflector.get<boolean>(
    'isPublic',
    context.getClass(),
  );

  if (publicContextClass || publicContextHandler) {
    return true;
  }
  return false;
}
