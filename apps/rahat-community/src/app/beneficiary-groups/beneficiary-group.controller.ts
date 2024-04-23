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
  Query,
} from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import {
  CreateBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { SUBJECTS } from '@rahataid/community-tool-sdk';

@Controller('beneficiary-group')
@ApiTags('BeneficiaryGroup')
@ApiBearerAuth('JWT')
export class BeneficiaryGroupController {
  constructor(
    private readonly beneficiaryGroupService: BeneficiaryGroupService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.ALL,
  })
  // @UseGuards(JwtGuard, AbilitiesGuard)
  create(@Body() dto: CreateBeneficiaryGroupDto) {
    return this.beneficiaryGroupService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.ALL,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findAll(@Query('') filters: any) {
    return this.beneficiaryGroupService.findAll(filters);
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.ALL,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiaryGroupService.findOne(uuid);
  }

  @Patch(':uuid')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({
    actions: ACTIONS.UPDATE,
    subject: SUBJECTS.ALL,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  update(
    @Param('uuid') uuid: string,
    @Body() updateBeneficiaryGroupDto: UpdateBeneficiaryGroupDto,
  ) {
    return this.beneficiaryGroupService.update(uuid, updateBeneficiaryGroupDto);
  }

  @Delete(':uuid')
  @CheckAbilities({
    actions: ACTIONS.DELETE,
    subject: SUBJECTS.ALL,
  })
  @UseGuards(JwtGuard, AbilitiesGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('uuid') uuid: string) {
    return this.beneficiaryGroupService.remove(uuid);
  }
}
