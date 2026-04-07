import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { QUEUE } from '../../constants';
import { BQUEUE } from '@rahataid/community-tool-sdk';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { BeneficiaryExportStrategy } from './strategies/beneficiary-export.strategy';
import { BeneficiaryCsvExportStrategy } from './strategies/beneficiary-csv-export.strategy';
import { GroupService } from '../groups/group.service';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { VerificationService } from '../beneficiaries/verification.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY }),
    BullModule.registerQueue({ name: BQUEUE.COMMUNITY_BENEFICIARY }),
  ],
  controllers: [ExportController],
  providers: [
    ExportService,
    BeneficiaryExportStrategy,
    BeneficiaryCsvExportStrategy,
    PrismaService,
    GroupService,
    BeneficiariesService,
    FieldDefinitionsService,
    BeneficiaryGroupService,
    VerificationService,
  ],
  exports: [
    ExportService,
    BeneficiaryExportStrategy,
    BeneficiaryCsvExportStrategy,
  ],
})
export class ExportModule {}
