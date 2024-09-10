import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateBeneficiaryCommDto,
  ListBeneficiaryCommDto,
  ListSessionLogsDto,
} from '@rahataid/community-tool-extensions';
import { ACTIONS, SUBJECTS } from '@rahataid/community-tool-sdk';
import { AbilitiesGuard, CheckAbilities, JwtGuard } from '@rumsan/user';
import { BeneficiaryCommsService } from './beneficiary-comms.service';

@Controller('beneficiary-comms')
@ApiTags('Beneficiary Comms')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
export class BeneficiaryCommsController {
  constructor(
    private readonly beneficiaryCommsService: BeneficiaryCommsService,
  ) {}

  @Post()
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  create(@Body() dto: CreateBeneficiaryCommDto, @Req() req: any) {
    dto.createdBy = req?.user?.uuid || '';
    return this.beneficiaryCommsService.create(dto);
  }

  @Get('transports')
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  listTransports() {
    return this.beneficiaryCommsService.listTransports();
  }

  @Get()
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  findAll(@Query() query: ListBeneficiaryCommDto) {
    return this.beneficiaryCommsService.findAll(query);
  }

  @Get(':uuid/logs')
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  sessionLogs(@Param('uuid') uuid: string, @Query() query: ListSessionLogsDto) {
    return this.beneficiaryCommsService.listSessionLogs(uuid, query);
  }

  @Get(':uuid/trigger')
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  trigger(@Param('uuid') uuid: string) {
    return this.beneficiaryCommsService.triggerCommunication(uuid);
  }

  @Get(':uuid')
  @CheckAbilities({
    actions: ACTIONS.READ,
    subject: SUBJECTS.BENEFICIARY_GROUP,
  })
  findOne(@Param('uuid') uuid: string) {
    return this.beneficiaryCommsService.findOne(uuid);
  }
}
