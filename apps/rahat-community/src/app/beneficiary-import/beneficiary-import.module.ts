import { Module } from '@nestjs/common';
import { BeneficiaryImportService } from './beneficiary-import.service';
import { BeneficiaryImportController } from './beneficiary-import.controller';
import { PrismaService } from '@rumsan/prisma';
import { SourceService } from '../sources/source.service';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { BQUEUE } from '@rahataid/community-tool-sdk';
import { GroupService } from '../groups/group.service';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY.IMPORT }),
    BullModule.registerQueue({ name: BQUEUE.COMMUNITY_BENEFICIARY }),
  ],
  controllers: [BeneficiaryImportController],
  providers: [
    FieldDefinitionsService,
    BeneficiaryImportService,
    BeneficiariesService,
    BeneficiarySourceService,
    PrismaService,
    SourceService,
    GroupService,
    BeneficiaryGroupService,
  ],
})
export class BeneficiaryImportModule {}
