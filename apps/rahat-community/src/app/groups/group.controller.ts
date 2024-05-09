import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateGroupDto,
  ListGroupDto,
  UpdateGroupDto,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import { GroupService } from './group.service';

@Controller('group')
@ApiTags('Group')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  create(@Body() dto: CreateGroupDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.groupService.create(dto);
  }

  @Post('download')
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.ALL })
  async downloadData(@Body('uuid') uuid: string) {
    return this.groupService.downloadData(uuid);
  }

  @Get()
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findAll(@Query() query: ListGroupDto) {
    return this.groupService.findAll(query);
  }

  @Get(':uuid')
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.ALL })
  findOne(@Param('uuid') uuid: string, @Query() query: ListGroupDto) {
    return this.groupService.findOne(uuid, query);
  }

  @Patch(':uuid')
  @CheckAbilities({ actions: ACTIONS.UPDATE, subject: SUBJECTS.ALL })
  update(@Param('uuid') uuid: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(uuid, updateGroupDto);
  }

  @Delete(':uuid/purge')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ALL })
  purgeGroup(@Param('uuid') uuid: string) {
    return this.groupService.purgeGroup(uuid);
  }

  @Delete(':uuid/:deleteBeneficiaryFlag')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.ALL })
  remove(
    @Param('uuid') uuid: string,
    @Param('deleteBeneficiaryFlag') deleteBeneficiaryFlag: boolean,
  ) {
    return this.groupService.remove(uuid, deleteBeneficiaryFlag);
  }
}
