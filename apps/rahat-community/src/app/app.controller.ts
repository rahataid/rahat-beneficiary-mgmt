import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import { AppService } from './app.service';
import {
  FilterBeneficiaryByLocationDto,
  UpsertUserAgreementDto,
} from '@rahataid/community-tool-extensions';
import { UUID } from 'crypto';

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
  @Get('user-agreement/:userId')
  getUserAgreement(@Param('userId') userId: string) {
    return this.appService.getUserAgreement(userId);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.PUBLIC })
  @Post('user-agreement')
  upsertUserAgreement(@Body() dto: UpsertUserAgreementDto) {
    return this.appService.upsertUserAgreement(dto);
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
  getSettings() {
    return this.appService.getSettings();
  }
}
