import { Module, ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from '@rahat/prisma';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RsUserModule } from '@rahat/user';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { FieldDefinitionsModule } from './field-definitions/field-definitions.module';
import { GroupModule } from './group/group.module';
import { BeneficiaryGroupModule } from './beneficiary-group/beneficiary-group.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    RsUserModule,
    PrismaModule,
    BeneficiariesModule,
    FieldDefinitionsModule,
    GroupModule,
    BeneficiaryGroupModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useClass: ValidationPipe },
    PrismaService,
  ],
})
export class AppModule {}
