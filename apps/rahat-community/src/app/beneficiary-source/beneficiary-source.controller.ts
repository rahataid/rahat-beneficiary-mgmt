import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BeneficiarySourceService } from './beneficiary-source.service';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('beneficiarySource')
@ApiTags('BeneficiarySource')
export class BeneficiarySourceController {
  constructor(
    private readonly beneficiarySourceService: BeneficiarySourceService,
  ) {}

  @Post('')
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateBeneficiarySourceDto) {
    return this.beneficiarySourceService.create(dto);
  }

  @Get('')
  findAll(query: any) {
    return this.beneficiarySourceService.listAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiarySourceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBeneficiarySourceDto) {
    return this.beneficiarySourceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.beneficiarySourceService.remove(id);
  }
}
