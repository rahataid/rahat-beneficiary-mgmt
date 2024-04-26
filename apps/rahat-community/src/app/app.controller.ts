import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import { AppService } from './app.service';

@Controller('app')
@ApiTags('APP')
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @ApiBearerAuth('JWT')
  @Get('kobo-import/:name')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  getDataFromKoboTool(@Param('name') name: string) {
    return this.appService.getDataFromKoboTool(name);
  }

  @Get('settings/kobotool')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  filterSettingByType() {
    return this.appService.findKobotoolSettings();
  }

  @Get('settings')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  getSettings() {
    return this.appService.getSettings();
  }
}
