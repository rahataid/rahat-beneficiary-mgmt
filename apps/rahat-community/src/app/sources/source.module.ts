import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { PrismaService } from '@rahat/prisma';

@Module({
  controllers: [SourceController],
  providers: [SourceService, PrismaService],
})
export class SourceModule {}
