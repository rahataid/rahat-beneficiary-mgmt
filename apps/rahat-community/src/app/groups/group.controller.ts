import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';
import {
  CreateGroupDto,
  UpdateGroupDto,
} from '@rahataid/community-tool-extensions';
import { Response } from 'express';

@Controller('group')
@ApiTags('Group')
// @ApiBearerAuth('JWT')
// @UseGuards(JwtGuard, AbilitiesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Post('download')
  async downloadData(@Body() data: any[], @Res() res: Response) {
    return this.groupService.downloadData(data, res);
  }

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  findAll(@Query() query: any) {
    return this.groupService.findAll(query);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  findOne(@Param('uuid') uuid: string) {
    return this.groupService.findOne(uuid);
  }

  @Patch(':uuid')
  @CheckAbilities({ actions: ACTIONS.MANAGE, subject: SUBJECTS.USER })
  update(@Param('uuid') uuid: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(uuid, updateGroupDto);
  }

  @Delete(':uuid/:deleteBeneficiaryFlag')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  remove(
    @Param('uuid') uuid: string,
    @Param('deleteBeneficiaryFlag') deleteBeneficiaryFlag: boolean,
  ) {
    return this.groupService.remove(uuid, deleteBeneficiaryFlag);
  }
}
