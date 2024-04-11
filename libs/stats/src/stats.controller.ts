import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  findAll() {
    return this.statsService.findAll();
  }

  @Get(':group')
  getByGroup(@Param('group') group: string) {
    return this.statsService.getByGroup(group);
  }
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.statsService.findOne(name);
  }
}
