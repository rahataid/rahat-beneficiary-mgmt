import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { CreateBeneficiaryGroupDto } from './dto/create-beneficiary-group.dto';
import { UpdateBeneficiaryGroupDto } from './dto/update-beneficiary-group.dto';

@Controller('beneficiary-group')
export class BeneficiaryGroupController {
  constructor(private readonly beneficiaryGroupService: BeneficiaryGroupService) {}

  @Post()
  create(@Body() createBeneficiaryGroupDto: CreateBeneficiaryGroupDto) {
    return this.beneficiaryGroupService.create(createBeneficiaryGroupDto);
  }

  @Get()
  findAll() {
    return this.beneficiaryGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiaryGroupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeneficiaryGroupDto: UpdateBeneficiaryGroupDto) {
    return this.beneficiaryGroupService.update(+id, updateBeneficiaryGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beneficiaryGroupService.remove(+id);
  }
}
