import { Module, ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from '@rahat/prisma';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
// import { CategoriesModule } from './categories/categories.module';
import { ManagersModule } from './managers/managers.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RsUserModule } from '@rahat/user';
// import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    RsUserModule,
    PrismaModule,
    // CategoriesModule,
    // ManagersModule,
    // CommunityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ValidationPipe },
    PrismaService,
  ],
})
export class AppModule {}
