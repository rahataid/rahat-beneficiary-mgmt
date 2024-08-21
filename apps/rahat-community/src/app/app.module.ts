import { Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { StatsModule } from '@rahataid/community-tool-stats';
import { PrismaService } from '@rumsan/prisma';
import { SettingsModule } from '@rumsan/extensions/settings';

import {
  AuthsModule,
  RSUserModule,
  RolesModule,
  UsersModule,
} from '@rumsan/user';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { BeneficiaryStatService } from './beneficiaries/beneficiaryStats.service';
import { BeneficiaryGroupModule } from './beneficiary-groups/beneficiary-group.module';
import { BeneficiaryImportModule } from './beneficiary-import/beneficiary-import.module';
import { BeneficiarySourceModule } from './beneficiary-sources/beneficiary-source.module';
import { FieldDefinitionsModule } from './field-definitions/field-definitions.module';
import { GroupModule } from './groups/group.module';
import { ListenersModule } from './listeners/listeners.module';
import { BeneficiaryProcessor, TargetProcessor } from './processors';
import { ScheduleService } from './schedulers/schedule.provider';
import { SourceModule } from './sources/source.module';
import { TargetModule } from './targets/target.module';
import { SocketGateway } from './gateway/socket.gateway';

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
    BeneficiaryStatService,
    SocketGateway,
  ],
})
export class AppModule {}
