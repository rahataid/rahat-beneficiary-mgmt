import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BeneficiarySourceService } from './beneficiary-source.service';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';

@Controller('beneficiary-source')
export class BeneficiarySourceController {
  constructor(
    private readonly beneficiarySourceService: BeneficiarySourceService,
  ) {}

  @Post()
  create(@Body() dto: CreateBeneficiarySourceDto) {
    return this.beneficiarySourceService.create(dto);
  }

  @Get()
  findAll() {
    return this.beneficiarySourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiarySourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBeneficiarySourceDto) {
    return this.beneficiarySourceService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficiarySourceService.remove(+id);
  }
}
