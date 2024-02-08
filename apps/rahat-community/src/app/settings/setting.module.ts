import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '@rahat/prisma';
import { SettingsService } from '@rahat/user';
import { AppSettingService } from './setting.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SettingsService, AppSettingService],
  exports: [],
})
export class AppSettingModule {}
