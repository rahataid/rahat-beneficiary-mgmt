import { Module } from '@nestjs/common';
import { ListenerService } from './listeners.service';
import { TargetService } from '../target/target.service';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { PrismaService } from '@rahat/prisma';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.TARGETING })],
  providers: [
    ListenerService,
    TargetService,
    PrismaService,
    BeneficiariesService,
    FieldDefinitionsService,
  ],
})
export class ListenersModule {}
