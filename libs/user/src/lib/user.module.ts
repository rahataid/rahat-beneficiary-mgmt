import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AbilityModule } from './ability/ability.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule, PrismaService } from '@rahat/prisma';

@Module({
  controllers: [AuthController, UserController],
  providers: [
    AuthService,
    PrismaService,
    UserService,
    JwtService,
    RolesService,
  ],
  imports: [
    AbilityModule,
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    RolesModule,
  ],
  exports: [AuthModule, UserModule],
})
export class RsUserModule {}
