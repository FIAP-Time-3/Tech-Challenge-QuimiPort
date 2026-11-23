import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtModule } from '@nestjs/jwt';
import configurations from '../configurations/configurations.js';
import { LoginController } from './login/infrastructure/controller/login.controller.js';
import { UsersModule } from './user/users.module.js';
import { LoginService } from './login/application/login.service.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: configurations().jwt.secret,
      signOptions: {
        expiresIn: configurations().jwt.accessTokenMinutes * 60,
      },
    }),
  ],
  exports: [JwtModule],
  controllers: [LoginController],
  providers: [
    LoginService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class SecurityModule {}
