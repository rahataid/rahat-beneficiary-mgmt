import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FieldDefinitionsService } from './field-definitions.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';

@Controller('field-definitions')
@ApiTags('Field Definitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class FieldDefinitionsController {
  constructor(private readonly fieldDefService: FieldDefinitionsService) {}

  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.FIELD_DEFINITION,
  })
  @Post()
  create(@Body() dto: CreateFieldDefinitionDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.fieldDefService.create(dto);
  }

  @Post('upload')
  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.FIELD_DEFINITION,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.fieldDefService.bulkUpload(file, req);
  }

  @ApiQuery({
    name: 'isTargeting',
    description: 'User for Targeting',
    type: Boolean,
    required: false,
  })
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.FIELD_DEFINITION })
  @Get()
  findAll(@Query() query: any) {
    return this.fieldDefService.findAll(query);
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.FIELD_DEFINITION })
  @Get('active')
  findActive() {
    return this.fieldDefService.listActive();
  }

  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.FIELD_DEFINITION })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldDefService.findOne(+id);
  }

  @CheckAbilities({
    actions: ACTIONS.UPDATE,
    subject: SUBJECTS.FIELD_DEFINITION,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFieldDefinitionDto) {
    return this.fieldDefService.update(+id, dto);
  }

  @CheckAbilities({
    actions: ACTIONS.DELETE,
    subject: SUBJECTS.FIELD_DEFINITION,
  })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: updateFieldStatusDto) {
    return this.fieldDefService.updateStatus(+id, dto);
  }
}
