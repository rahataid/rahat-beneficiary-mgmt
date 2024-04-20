import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '@rumsan/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BullModule } from '@nestjs/bull';
import { BQUEUE } from '@rahataid/community-tool-sdk';
import { StatsModule } from '@rahataid/community-tool-stats';
import { BeneficiaryStatService } from './beneficiaryStats.service';
import { LogModule } from '../auditLog/log.module';
import { LogService } from '../auditLog/log.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BQUEUE.COMMUNITY_BENEFICIARY,
    }),
    StatsModule,
    LogModule,
  ],
  controllers: [BeneficiariesController],
  providers: [
    BeneficiariesService,
    PrismaService,
    FieldDefinitionsService,
    BeneficiaryStatService,
    LogService,
  ],
})
export class BeneficiariesModule {}
