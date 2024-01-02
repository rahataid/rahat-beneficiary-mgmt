import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { PrismaModule } from '@rahat/prisma';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
  imports: [PrismaModule],
})
export class CommunityModule {}
