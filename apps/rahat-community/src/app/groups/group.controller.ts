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
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rahat/user';

@Controller('group')
@ApiTags('Group')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @CheckAbilities({ action: ACTIONS.CREATE, subject: SUBJECTS.USER })
  create(@Body() dto: CreateGroupDto) {
    return this.groupService.create(dto);
  }

  @Get()
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  findAll(@Query() query: any) {
    return this.groupService.findAll(query);
  }

  @Get(':id')
  @CheckAbilities({ action: ACTIONS.READ, subject: SUBJECTS.USER })
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(+id);
  }

  @Patch(':id')
  @CheckAbilities({ action: ACTIONS.MANAGE, subject: SUBJECTS.USER })
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  @CheckAbilities({ action: ACTIONS.DELETE, subject: SUBJECTS.USER })
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }
}
