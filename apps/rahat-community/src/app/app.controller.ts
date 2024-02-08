import { Controller, Get, Param } from '@nestjs/common';

import { AppService } from './app.service';
import { getSetting, listSettings } from './settings/setting.config';
import { AppSettingService } from './settings/setting.service';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private appSetttingService: AppSettingService,
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('getDataFromKobo')
  getDataFromKoboTool() {
    return this.appService.getDataFromKoboTool();
  }

  @Get('settings')
  listSettings() {
    return listSettings();
  }

  @Get('settings/:name')
  getEmailSettings(@Param('name') name: string) {
    return getSetting(name);
  }
}
