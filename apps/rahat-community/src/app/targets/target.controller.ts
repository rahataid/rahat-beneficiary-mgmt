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
  SUBJECTS,
} from '@rumsan/user';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
  ListTargetQueryDto,
  updateTargetQueryLabelDTO,
} from '@rahataid/community-tool-extensions';

@Controller('targets')
@ApiTags('Targets')
@ApiBearerAuth('JWT')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query('') filters: ListTargetQueryDto) {
    return this.targetService.list(filters);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateTargetQueryDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.targetService.create(dto);
  }

  @Post('export/:targetUUID')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  exportBeneficiaries(@Param('targetUUID') targetUUID: string) {
    return this.targetService.exportTargetBeneficiaries(targetUUID);
  }

  @Post('search')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  search(@Body() data: CreateTargetQueryDto) {
    return this.targetService.searchTargetBeneficiaries(data);
  }

  @Post('targetResult')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  target(@Body() data: CreateTargetResultDto) {
    return this.targetService.saveTargetResult(data);
  }

  @Patch(':uuid/label')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  updateTargetQueryLabel(
    @Param('uuid') uuid: string,
    @Body() dto: updateTargetQueryLabelDTO,
  ) {
    return this.targetService.updateTargetQueryLabel(uuid, dto);
  }

  @Get(':target_uuid/result')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('target_uuid') target_uuid: string) {
    return this.targetService.findByTargetUUID(target_uuid);
  }
}
