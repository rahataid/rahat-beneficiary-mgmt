import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaService } from '@rumsan/prisma';
import { BeneficiaryGroupModule } from '../beneficiary-groups/beneficiary-group.module';
import { BeneficiariesModule } from '../beneficiaries/beneficiaries.module';
import { BeneficiarySourceModule } from '../beneficiary-sources/beneficiary-source.module';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  imports: [
    BeneficiaryGroupModule,
    BeneficiariesModule,
    BeneficiarySourceModule,
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY }),
  ],
  exports: [GroupService],
})
export class GroupModule {}
