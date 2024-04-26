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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FieldDefinitionsService } from './field-definitions.service';

import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rumsan/user';
import { ACTIONS } from '@rumsan/user';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@rahataid/community-tool-extensions';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/multer';
import { SUBJECTS } from '@rahataid/community-tool-sdk';

@Controller('field-definitions')
@ApiTags('Field Definitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class FieldDefinitionsController {
  constructor(private readonly fieldDefService: FieldDefinitionsService) {}

  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.ALL,
  })
  @Post()
  create(@Body() dto: CreateFieldDefinitionDto) {
    return this.fieldDefService.create(dto);
  }

  @Post('upload')
  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.ALL,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.fieldDefService.bulkUpload(file);
  }

  @ApiQuery({
    name: 'isTargeting',
    description: 'User for Targeting',
    type: Boolean,
    required: false,
  })
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @Get()
  findAll(@Query() query: any) {
    return this.fieldDefService.findAll(query);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @Get('active')
  findActive() {
    return this.fieldDefService.listActive();
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldDefService.findOne(+id);
  }

  @CheckAbilities({
    actions: ACTIONS.UPDATE,
    subject: SUBJECTS.ALL,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFieldDefinitionDto) {
    return this.fieldDefService.update(+id, dto);
  }

  @CheckAbilities({
    actions: ACTIONS.DELETE,
    subject: SUBJECTS.ALL,
  })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: updateFieldStatusDto) {
    return this.fieldDefService.updateStatus(+id, dto);
  }
}
