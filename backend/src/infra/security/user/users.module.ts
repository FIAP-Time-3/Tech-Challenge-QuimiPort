import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UserService } from './application/user.service.js';
import { UserCredentialsService } from './application/user-credentials.service.js';
import { FirstAdminService } from './application/first-admin.service.js';
import { FirstAdminController } from './infrastructure/controller/first-admin/first-admin.controller.js';
import { MeController } from './infrastructure/controller/me/me.controller.js';
import { OperadoresController } from './infrastructure/controller/operadores/operadores.controller.js';
import { DespachantesController } from './infrastructure/controller/despachantes/despachantes.controller.js';
import { AdministradoresController } from './infrastructure/controller/administradores/administradores.controller.js';

@Module({
  controllers: [
    AdministradoresController,
    OperadoresController,
    DespachantesController,
    MeController,
    FirstAdminController,
  ],
  providers: [
    PrismaService,
    UserService,
    UserCredentialsService,
    FirstAdminService,
  ],
  exports: [PrismaService],
})
export class UsersModule {}
