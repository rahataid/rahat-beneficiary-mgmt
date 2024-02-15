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
} from '@nestjs/common';
import { TargetService } from './target.service';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
} from './dto/create-target.dto';
import { ApiTags } from '@nestjs/swagger';
import { updateTargetQueryLabelDTO } from './dto/update-target.dto';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rahat/user';

@Controller('targets')
@ApiTags('Target')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Get()
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll() {
    return this.targetService.list();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateTargetQueryDto) {
    return this.targetService.create(dto);
  }

  @Post('export/:targetUUID')
  @HttpCode(HttpStatus.OK)
  // @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  exportBeneficiaries(@Param('targetUUID') targetUUID: string) {
    return this.targetService.exportTargetBeneficiaries(targetUUID);
  }

  @Post('search')
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  search(@Body() data: CreateTargetQueryDto) {
    return this.targetService.searchTargetBeneficiaries(data);
  }

  @Post('targetResult')
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  target(@Body() data: CreateTargetResultDto) {
    return this.targetService.saveTargetResult(data);
  }

  @Patch(':id/label')
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  updateTargetQueryLabel(
    @Param('id') id: number,
    @Body() dto: updateTargetQueryLabelDTO,
  ) {
    return this.targetService.updateTargetQueryLabel(id, dto);
  }

  @Get(':target_uuid/result')
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.ALL })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('target_uuid') target_uuid: string) {
    return this.targetService.findByTargetUUID(target_uuid);
  }
}
