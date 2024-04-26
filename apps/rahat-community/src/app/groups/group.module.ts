import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaService } from '@rumsan/prisma';
import { BeneficiaryGroupModule } from '../beneficiary-groups/beneficiary-group.module';
import { BeneficiariesModule } from '../beneficiaries/beneficiaries.module';
import { BeneficiarySourceModule } from '../beneficiary-sources/beneficiary-source.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  imports: [
    BeneficiaryGroupModule,
    BeneficiariesModule,
    BeneficiarySourceModule,
  ],
  exports: [GroupService],
})
export class GroupModule {}
