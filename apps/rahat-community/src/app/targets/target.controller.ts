import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TargetService } from './target.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
  ExportTargetBeneficiaryDto,
  ListTargetQueryDto,
  ListTargetUIDDto,
  updateTargetQueryLabelDTO,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import { UUID } from 'crypto';

@Controller('targets')
@ApiTags('Targets')
@ApiBearerAuth('JWT')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query('') filters: ListTargetQueryDto) {
    return this.targetService.list(filters);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateTargetQueryDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.targetService.create(dto);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  exportBeneficiaries(@Body() dto: ExportTargetBeneficiaryDto) {
    return this.targetService.exportGroupedBeneficiaries(dto);
  }

  @Post('search')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  search(@Body() data: CreateTargetQueryDto) {
    return this.targetService.searchTargetBeneficiaries(data);
  }

  @Post('targetResult')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  target(@Body() data: CreateTargetResultDto) {
    return this.targetService.saveTargetResult(data);
  }

  @Patch(':uuid/label')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  updateTargetQueryLabel(
    @Param('uuid') uuid: string,
    @Body() dto: updateTargetQueryLabelDTO,
    @Req() req: any,
  ) {
    dto.createdBy = req?.user?.uuid || '';
    return this.targetService.updateTargetQueryLabel(uuid, dto);
  }

  @Get(':target_uuid/result')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(
    @Param('target_uuid') target_uuid: string,
    @Query() query?: ListTargetUIDDto,
  ) {
    return this.targetService.findByTargetUUID(target_uuid, query);
  }

  @Post(':target_uuid/download')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  downloadPinnedBenificiary(@Param('target_uuid') target_uuid: string) {
    return this.targetService.downloadPinnedBeneficiary(target_uuid);
  }
}
