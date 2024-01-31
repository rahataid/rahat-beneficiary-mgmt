import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TargetService } from './target.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('targets')
@ApiTags('Target')
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Post()
  create(@Body() dto: CreateTargetDto) {
    return this.targetService.create(dto);
  }

  @Get()
  findAll() {
    return this.targetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.targetService.findOne(+id);
  }
}
