import { Module } from '@nestjs/common';
import { TargetService } from './target.service';
import { TargetController } from './target.controller';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { PrismaService } from '@rahat/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.TARGETING })],
  controllers: [TargetController],
  providers: [
    TargetService,
    BeneficiariesService,
    PrismaService,
    FieldDefinitionsService,
  ],
})
export class TargetModule {}
