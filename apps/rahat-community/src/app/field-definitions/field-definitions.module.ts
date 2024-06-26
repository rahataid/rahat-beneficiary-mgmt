import { Module } from '@nestjs/common';
import { FieldDefinitionsService } from './field-definitions.service';
import { FieldDefinitionsController } from './field-definitions.controller';
import { PrismaService } from '@rumsan/prisma';

@Module({
  controllers: [FieldDefinitionsController],
  providers: [FieldDefinitionsService, PrismaService],
})
export class FieldDefinitionsModule {}
