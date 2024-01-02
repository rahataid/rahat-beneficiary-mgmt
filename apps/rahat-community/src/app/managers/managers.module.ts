import { Module } from '@nestjs/common';
import { ManagersController } from './managers.controller';
import { ManagersService } from './managers.service';
import { PrismaModule } from '@rahat/prisma';

@Module({
  controllers: [ManagersController],
  providers: [ManagersService],
  imports: [PrismaModule],
})
export class ManagersModule {}
