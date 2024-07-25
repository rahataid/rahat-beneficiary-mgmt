import { Module } from '@nestjs/common';
import { TargetService } from './target.service';
import { TargetController } from './target.controller';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { PrismaService } from '@rumsan/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { BQUEUE } from '@rahataid/community-tool-sdk';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { GroupModule } from '../groups/group.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE.TARGETING }),
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY }),
    BullModule.registerQueue({ name: BQUEUE.COMMUNITY_BENEFICIARY }),
    GroupModule
  ],
  controllers: [TargetController],
  providers: [
    TargetService,
    BeneficiariesService,
    PrismaService,
    FieldDefinitionsService,
    BeneficiaryGroupService,
  ],
})
export class TargetModule {}
