import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SourceService } from './source.service';
import {
  CreateBeneficiarySourceDto,
  CreateSourceDto,
} from './dto/create-beneficiary-source.dto';
import {
  UpdateBeneficiarySourceDto,
  UpdateSourceDto,
} from './dto/update-beneficiary-source.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('sources')
@ApiTags('Sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateSourceDto) {
    return this.sourceService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.sourceService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.sourceService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateSourceDto) {
    return this.sourceService.update(uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.sourceService.remove(uuid);
  }
}
