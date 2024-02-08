import { Module, ValidationPipe } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, PrismaService } from '@rahat/prisma';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { RsUserModule, SettingsService } from '@rahat/user';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { FieldDefinitionsModule } from './field-definitions/field-definitions.module';
import { GroupModule } from './groups/group.module';
import { BeneficiaryGroupModule } from './beneficiary-groups/beneficiary-group.module';
import { MulterModule } from '@nestjs/platform-express';
import { SourceModule } from './sources/source.module';
import { BeneficiaryImportModule } from './beneficiary-import/beneficiary-import.module';
import { BeneficiarySourceModule } from './beneficiary-sources/beneficiary-source.module';
import { TargetModule } from './targets/target.module';
import { TargetProcessor } from './processors';
import { ListenersModule } from './listeners/listeners.module';
import { AppSettingService } from './settings/setting.service';
import { AppSettingModule } from './settings/setting.module';
import { ScheduleService } from './schedulers/schedule.provider';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    EventEmitterModule.forRoot({ maxListeners: 10, ignoreErrors: false }),
    RsUserModule,
    PrismaModule,
    SourceModule,
    BeneficiariesModule,
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
    AppSettingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TargetProcessor,
    { provide: APP_PIPE, useClass: ValidationPipe },
    PrismaService,
    AppSettingService,
    SettingsService,
    ScheduleService,
  ],
})
export class AppModule {}
