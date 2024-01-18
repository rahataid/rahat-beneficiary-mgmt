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

  @Post('beneficiarySource')
  createBeneficiarySource(@Body() dto: CreateBeneficiarySourceDto) {
    return this.sourceService.createBeneficiarySource(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.sourceService.findAll(query);
  }

  @Get('beneficiarySource')
  listAllBeneficiarySource(query: any) {
    return this.sourceService.listAllBeneficiarySource(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.sourceService.findOne(uuid);
  }

  @Get(':id/beneficiarySource')
  findOneBeneficiarySource(@Param('id') id: string) {
    return this.sourceService.findOneBeneficiarySource(id);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateSourceDto) {
    return this.sourceService.update(uuid, dto);
  }

  @Patch(':id/beneficiarySource')
  updateBeneficiarySource(
    @Param('id') id: string,
    @Body() dto: UpdateBeneficiarySourceDto,
  ) {
    return this.sourceService.updateBeneficiarySource(id, dto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.sourceService.remove(uuid);
  }

  @Delete(':id/beneficiarySource')
  removeBeneficiarySource(@Param('id') id: string) {
    return this.sourceService.removeBeneficiarySource(id);
  }
}
