import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { PrismaService } from '@rumsan/prisma';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';
import { FieldDefinitionsModule } from '../field-definitions/field-definitions.module';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';

@Module({
  imports: [
    FieldDefinitionsModule,
    BullModule.registerQueue({ name: QUEUE.BENEFICIARY }),
  ],
  controllers: [SourceController],
  providers: [SourceService, PrismaService, FieldDefinitionsService],
})
export class SourceModule {}
