import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { ManagersService } from './managers.service';

@Controller('managers')
@ApiTags('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Post('add')
  create(@Body() manager: CreateManagerDto) {
    return this.managersService.create(manager);
  }

  @Get('list')
  findAll(@Query() query?: any) {
    return this.managersService.findAll(query);
  }

  @Get('list/:address')
  findOne(@Param('address') address: string, @Query() query?: any) {
    return this.managersService.findOne(address, query);
  }

  @Patch('update')
  update(@Body() updateManagerDto: UpdateManagerDto) {
    return this.managersService.update(updateManagerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.managersService.remove(+id);
  }
}
