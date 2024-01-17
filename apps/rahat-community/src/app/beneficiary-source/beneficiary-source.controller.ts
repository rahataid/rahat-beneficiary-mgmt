import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BeneficiarySourceService } from './beneficiary-source.service';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('beneficiary-source')
@ApiTags('Beneficiary Source')
export class BeneficiarySourceController {
  constructor(
    private readonly beneficiarySourceService: BeneficiarySourceService,
  ) {}

  @Post()
  create(@Body() dto: CreateBeneficiarySourceDto) {
    return this.beneficiarySourceService.create(dto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.beneficiarySourceService.findAll(query);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiarySourceService.findOne(uuid);
  }

  @Patch(':uuid')
  update(@Param('uuid') uuid: string, @Body() dto: UpdateBeneficiarySourceDto) {
    return this.beneficiarySourceService.update(uuid, dto);
  }

  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.beneficiarySourceService.remove(uuid);
  }
}
