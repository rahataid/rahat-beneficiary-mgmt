import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FilterBeneficiaryByLocationDto,
  ListSettingDto,
  UpdateSettngsDto,
} from '@rahataid/community-tool-extensions';
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
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  @Get('stats')
  getStats(@Query('') query: FilterBeneficiaryByLocationDto) {
    return this.appService.getStats(query);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  @Get('kobo-import/:name')
  getDataFromKoboTool(@Param('name') name: string) {
    return this.appService.getDataFromKoboTool(name);
  }

  @Get('settings/kobotool')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  filterSettingByType() {
    return this.appService.findKobotoolSettings();
  }

  @Get('settings')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  getSettings(@Query() query: ListSettingDto) {
    return this.appService.getSettings(query);
  }

  @Patch('settings/update/:name')
  @ApiBearerAuth('JWT')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  update(@Param('name') name: string, @Body() dto: UpdateSettngsDto) {
    console.log(name);
    return this.appService.updateSettngs(name, dto);
  }
}
