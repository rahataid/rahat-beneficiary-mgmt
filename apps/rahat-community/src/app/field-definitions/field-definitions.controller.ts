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
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import {
  UpdateFieldDefinitionDto,
  updateStatusDto,
} from './dto/update-field-definition.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rahat/user';
import { ACTIONS, SUBJECTS } from 'libs/user/src/lib/constants';

@Controller('field-definitions')
@ApiTags('Field Definitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class FieldDefinitionsController {
  constructor(private readonly fieldDefService: FieldDefinitionsService) {}

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Post()
  create(@Body() dto: CreateFieldDefinitionDto) {
    return this.fieldDefService.create(dto);
  }

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get()
  findAll(@Query() query: any) {
    return this.fieldDefService.findAll(query);
  }

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get('active')
  findActive() {
    return this.fieldDefService.listActive();
  }

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldDefService.findOne(+id);
  }

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFieldDefinitionDto) {
    return this.fieldDefService.update(+id, dto);
  }

  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: updateStatusDto) {
    return this.fieldDefService.updateStatus(+id, dto);
  }
}
