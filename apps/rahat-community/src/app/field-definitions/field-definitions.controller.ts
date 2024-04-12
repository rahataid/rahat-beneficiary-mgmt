import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FieldDefinitionsService } from './field-definitions.service';

import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rumsan/user';
import { ACTIONS, SUBJECTS } from '@rumsan/user';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@community-tool/extentions';

@Controller('field-definitions')
@ApiTags('Field Definitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class FieldDefinitionsController {
  constructor(private readonly fieldDefService: FieldDefinitionsService) {}

  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Post()
  create(@Body() dto: CreateFieldDefinitionDto) {
    return this.fieldDefService.create(dto);
  }

  @ApiQuery({
    name: 'isTargeting',
    description: 'User for Targeting',
    type: Boolean,
    required: false,
  })
  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get()
  findAll(@Query() query: any) {
    return this.fieldDefService.findAll(query);
  }

  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get('active')
  findActive() {
    return this.fieldDefService.listActive();
  }

  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldDefService.findOne(+id);
  }

  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFieldDefinitionDto) {
    return this.fieldDefService.update(+id, dto);
  }

  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: updateFieldStatusDto) {
    return this.fieldDefService.updateStatus(+id, dto);
  }
}
