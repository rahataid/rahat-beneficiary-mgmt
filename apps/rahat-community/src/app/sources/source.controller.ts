import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SourceService } from './source.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import {
  CreateSourceDto,
  UpdateSourceDto,
} from '@rahataid/community-tool-extensions';

@Controller('sources')
@ApiTags('Sources')
@ApiBearerAuth('JWT')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateSourceDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.sourceService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query() query: any) {
    return this.sourceService.findAll(query);
  }

  @Get(':importId/mappings')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  getMappings(@Param('importId') importId: string) {
    return this.sourceService.getMappingsByImportId(importId);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.sourceService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  update(@Param('uuid') uuid: string, @Body() dto: UpdateSourceDto) {
    return this.sourceService.update(uuid, dto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  remove(@Param('uuid') uuid: string) {
    return this.sourceService.remove(uuid);
  }
}
