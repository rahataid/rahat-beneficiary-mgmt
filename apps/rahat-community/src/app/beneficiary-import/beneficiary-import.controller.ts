import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BeneficiaryImportService } from './beneficiary-import.service';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import { SUBJECTS } from '@rahataid/community-tool-sdk';

@ApiTags('Beneficiary Import')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard, AbilitiesGuard)
@Controller('beneficiary-imports')
export class BeneficiaryImportController {
  constructor(
    private readonly beneficiaryImportService: BeneficiaryImportService,
  ) {}

  @Get(':source_uuid/import')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'groupName', required: false, description: 'Optional group name for import' })
  @CheckAbilities({
    actions: ACTIONS.CREATE,
    subject: SUBJECTS.BENEFICIARY,
  })
  importBySourceUUID(@Param('source_uuid') uuid: string, @Query('groupName') groupName?: string) {
    return this.beneficiaryImportService.importBySourceUUID(uuid, groupName);
  }
}
