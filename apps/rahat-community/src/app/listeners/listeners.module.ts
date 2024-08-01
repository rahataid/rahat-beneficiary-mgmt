import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { QUEUE } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { SourceService } from '../sources/source.service';
import { TargetService } from '../targets/target.service';
import { ListenerService } from './listeners.service';
import { StatsService } from '@rahataid/community-tool-stats';
import { BeneficiaryStatService } from '../beneficiaries/beneficiaryStats.service';
import { GroupService } from '../groups/group.service';
import { EmailService } from './mail.service';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { VerificationService } from '../beneficiaries/verification.service';
import { BQUEUE } from '@rahataid/community-tool-sdk';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE.TARGETING }),
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY }),
    BullModule.registerQueue({ name: BQUEUE.COMMUNITY_BENEFICIARY }),
  ],
  providers: [
    ListenerService,
    TargetService,
    PrismaService,
    BeneficiariesService,
    FieldDefinitionsService,
    BeneficiaryImportService,
    BeneficiarySourceService,
    SourceService,
    EmailService,
    StatsService,
    BeneficiaryStatService,
    GroupService,
    BeneficiaryGroupService,
    VerificationService,
  ],
})
export class ListenersModule {}
