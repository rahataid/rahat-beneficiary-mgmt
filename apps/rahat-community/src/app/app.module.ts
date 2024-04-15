import { Module, ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@rumsan/prisma';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { FieldDefinitionsModule } from './field-definitions/field-definitions.module';
import { GroupModule } from './groups/group.module';
import { BeneficiaryGroupModule } from './beneficiary-groups/beneficiary-group.module';
import { MulterModule } from '@nestjs/platform-express';
import { SourceModule } from './sources/source.module';
import { BeneficiaryImportModule } from './beneficiary-import/beneficiary-import.module';
import { BeneficiarySourceModule } from './beneficiary-sources/beneficiary-source.module';
import { TargetModule } from './targets/target.module';
import { BeneficiaryProcessor, TargetProcessor } from './processors';
import { ListenersModule } from './listeners/listeners.module';
import { ScheduleService } from './schedulers/schedule.provider';
import {
  AuthsModule,
  RSUserModule,
  RolesModule,
  UsersModule,
} from '@rumsan/user';
import { SettingsModule } from '@rumsan/settings';
import { StatsModule } from '@rahataid/community-tool-stats';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    RSUserModule.forRoot([AuthsModule, UsersModule, RolesModule]),
    StatsModule,
    BeneficiariesModule,
    SourceModule,
    FieldDefinitionsModule,
    GroupModule,
    BeneficiaryGroupModule,
    MulterModule.register({
      dest: './file',
    }),
    BeneficiaryImportModule,
    BeneficiarySourceModule,
    TargetModule,
    ListenersModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TargetProcessor,
    BeneficiaryProcessor,
    PrismaService,
    ScheduleService,
  ],
})
export class AppModule {}
