import { Module } from '@nestjs/common';
import { ListenerService } from './listeners.service';
import { TargetService } from '../targets/target.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { PrismaService } from '@rahat/prisma';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { SourceService } from '../sources/source.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE.TARGETING }),
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY.IMPORT }),
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
  ],
})
export class ListenersModule {}
