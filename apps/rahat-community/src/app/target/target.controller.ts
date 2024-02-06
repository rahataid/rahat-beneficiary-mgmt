import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { TargetService } from './target.service';
import { CreateTargetQueryDto } from './dto/create-target.dto';
import { ApiTags } from '@nestjs/swagger';
import { updateTargetQueryLabelDTO } from './dto/update-target.dto';

@Controller('targets')
@ApiTags('Target')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Post()
  create(@Body() dto: CreateTargetQueryDto) {
    return this.targetService.create(dto);
  }

  @Patch(':id/label')
  updateTargetQueryLabel(
    @Param('id') id: number,
    @Body() dto: updateTargetQueryLabelDTO,
  ) {
    return this.targetService.updateTargetQueryLabel(id, dto);
  }

  @Get(':target_uuid/result')
  findOne(@Param('target_uuid') target_uuid: string) {
    return this.targetService.findByTargetUUID(target_uuid);
  }
}
