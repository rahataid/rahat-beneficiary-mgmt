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
  UseGuards,
} from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { CreateBeneficiaryGroupDto } from './dto/create-beneficiary-group.dto';
import { UpdateBeneficiaryGroupDto } from './dto/update-beneficiary-group.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
  SUBJECTS,
} from '@rumsan/user';

@Controller('beneficiary-group')
@ApiTags('BeneficiaryGroup')
@ApiBearerAuth('JWT')
export class BeneficiaryGroupController {
  constructor(
    private readonly beneficiaryGroupService: BeneficiaryGroupService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateBeneficiaryGroupDto) {
    console.log(dto);
    return this.beneficiaryGroupService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  findAll() {
    return this.beneficiaryGroupService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('id') id: string) {
    return this.beneficiaryGroupService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  update(
    @Param('id') id: string,
    @Body() updateBeneficiaryGroupDto: UpdateBeneficiaryGroupDto,
  ) {
    return this.beneficiaryGroupService.update(+id, updateBeneficiaryGroupDto);
  }

  @Delete(':id')
  @CheckAbilities({ actions: ACTIONS.DELETE, subject: SUBJECTS.USER })
  @UseGuards(JwtGuard, AbilitiesGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.beneficiaryGroupService.remove(+id);
  }
}
