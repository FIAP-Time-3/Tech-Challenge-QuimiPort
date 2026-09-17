// Use este decorator para marcar rota como publica
// Rotas Publicas não validam ROLE nem TOKEN

import { SetMetadata } from '@nestjs/common';

export const SetPublic = (): MethodDecorator & ClassDecorator => {
  return SetMetadata('isPublic', true);
};
