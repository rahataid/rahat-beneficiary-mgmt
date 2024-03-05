import { Global, Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from '@rumsan/prisma';
import { SettingsService } from '@rumsan/settings';
import { AppSettingService } from './setting.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SettingsService, AppSettingService, PrismaService],
  exports: [],
})
export class AppSettingModule {}
