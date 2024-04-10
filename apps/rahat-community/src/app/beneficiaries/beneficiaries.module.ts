import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '@rumsan/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BullModule } from '@nestjs/bull';
import { BQUEUE } from '@community-tool/sdk';
import { StatsModule } from '@community-tool/stats';
import { BeneficiaryStatService } from './beneficiaryStats.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BQUEUE.COMMUNITY_BENEFICIARY,
    }),
    StatsModule,
  ],
  controllers: [BeneficiariesController],
  providers: [
    BeneficiariesService,
    PrismaService,
    FieldDefinitionsService,
    BeneficiaryStatService,
  ],
})
export class BeneficiariesModule {}
