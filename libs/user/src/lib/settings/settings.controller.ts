import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSettingsDto, EditSettingsDto } from './dto';
import { SettingsService } from './settings.service';
import { CheckAbilities } from '../ability/ability.decorator';
import { ACTIONS, SUBJECTS } from '../constants';
import { ApiTags } from '@nestjs/swagger';

@Controller('settings')
@ApiTags('Settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Post()
  createSettings(@Body() dto: CreateSettingsDto) {
    return this.settingsService.create(dto);
  }

  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get()
  listPublicSettings() {
    return this.settingsService.listPublic();
  }

  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get(':id')
  getById(@Param('id') id: number) {
    return this.settingsService.getPublic(id);
  }

  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get(':name/name')
  getByName(@Param('name') name: string) {
    return this.settingsService.getByName(name);
  }

  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Patch('')
  updateByName(@Body() dto: EditSettingsDto) {
    return this.settingsService.updateByName(dto);
  }
}
