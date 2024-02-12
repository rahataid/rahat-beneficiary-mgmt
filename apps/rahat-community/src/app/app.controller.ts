import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AppService } from './app.service';
import { getSetting, listSettings } from './settings/setting.config';
import { AppSettingService } from './settings/setting.service';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rahat/user';

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
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  getDataFromKoboTool() {
    return this.appService.getDataFromKoboTool();
  }

  @Get('settings')
  listSettings() {
    return listSettings();
  }

  @Get('settings/:name')
  getSettings(@Param('name') name: string) {
    return getSetting(name);
  }

  // @Get('settings/:customkey')
  // getSettingsData(@Param('customKey') customKey: string) {
  //   return this.appSetttingService.getDynamicSettingForCustomId(customKey);
  // }
}
