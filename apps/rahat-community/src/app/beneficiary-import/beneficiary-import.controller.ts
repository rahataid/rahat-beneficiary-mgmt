import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BeneficiaryImportService } from './beneficiary-import.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Beneficiary Import')
@ApiBearerAuth('JWT')
@Controller('beneficiary-imports')
export class BeneficiaryImportController {
  constructor(
    private readonly beneficiaryImportService: BeneficiaryImportService,
  ) {}

  @Get(':source_uuid/import')
  @HttpCode(HttpStatus.OK)
  importBySourceUUID(@Param('source_uuid') uuid: string) {
    return this.beneficiaryImportService.importBySourceUUID(uuid);
  }
}
