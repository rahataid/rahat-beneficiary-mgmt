import { Module } from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { BeneficiaryGroupController } from './beneficiary-group.controller';
import { PrismaService } from '@rumsan/prisma';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';
import { BeneficiaryImportModule } from '../beneficiary-import/beneficiary-import.module';
import { SourceModule } from '../sources/source.module';
import { SourceService } from '../sources/source.service';


@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.BENEFICIARY })],
  controllers: [BeneficiaryGroupController],
  providers: [BeneficiaryGroupService, PrismaService],
  exports: [BeneficiaryGroupService],
})
export class BeneficiaryGroupModule {}
