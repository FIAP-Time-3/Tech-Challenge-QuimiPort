import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';
import configurations from '../configurations/configurations.js';
import { LoginController } from './login/infrastructure/controller/login.controller.js';
import { PrismaService } from '../database/prisma.service.js';
import { LoginService } from './login/application/login.service.js';
import { UserService } from './user/application/user.service.js';
import { FirstAdminController } from './user/infrastructure/controller/first-admin/first-admin.controller.js';
import { MeController } from './user/infrastructure/controller/me/me.controller.js';
import { UserController } from './user/infrastructure/controller/user.controller.js';
import { OperadoresController } from './user/infrastructure/controller/operadores/operadores.controller.js';
import { DespachantesController } from './user/infrastructure/controller/despachantes/despachantes.controller.js';
import { AdministradoresController } from './user/infrastructure/controller/administradores/administradores.controller.js';

@Module({
  imports: [
    JwtModule.register({
      secret: configurations().jwt.secret,
      signOptions: {
        expiresIn: configurations().jwt.accessTokenMinutes * 60,
      },
    }),
  ],
  exports: [JwtModule],
  controllers: [
    LoginController,
    UserController,
    OperadoresController,
    DespachantesController,
    AdministradoresController,
    MeController,
    FirstAdminController,
  ],
  providers: [
    UserService,
    PrismaService,
    LoginService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class SecurityModule {}
