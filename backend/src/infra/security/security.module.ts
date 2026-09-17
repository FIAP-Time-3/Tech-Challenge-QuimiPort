import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';
import configurations from '../configurations/configurations.js';
import { LoginController } from './login/infrastructure/controller/login.controller.js';
import { PrismaService } from '../database/prisma.service.js';
import { LoginService } from './login/application/Login.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: configurations().jwt.secret,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  exports: [JwtModule],
  controllers: [LoginController],
  providers: [
    PrismaService,
    LoginService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class SecurityModule {}
