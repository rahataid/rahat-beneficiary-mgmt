import { Module } from '@nestjs/common';
import { BeneficiaryImportService } from './beneficiary-import.service';
import { BeneficiaryImportController } from './beneficiary-import.controller';
import { PrismaService } from '@rahat/prisma';
import { SourceService } from '../sources/source.service';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.BENEFICIARY.IMPORT })],
  controllers: [BeneficiaryImportController],
  providers: [
    FieldDefinitionsService,
    BeneficiaryImportService,
    BeneficiariesService,
    BeneficiarySourceService,
    PrismaService,
    SourceService,
  ],
})
export class BeneficiaryImportModule {}
