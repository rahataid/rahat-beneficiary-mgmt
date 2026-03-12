import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ACTIONS,
  AbilitiesGuard,
  CheckAbilities,
  JwtGuard,
} from '@rumsan/user';
import { SUBJECTS } from '@rahataid/community-tool-sdk';
import { ExportService } from './export.service';
import {
  ExportBeneficiaryDateRangeDto,
  ExportToAppDto,
} from './dto/export-beneficiary.dto';

@Controller('exports')
@ApiTags('Exports')
@ApiBearerAuth('JWT')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * Export group beneficiaries as a CSV file download.
   * Supports optional date-range filtering on beneficiary createdAt.
   */
  @Post('beneficiaries/csv')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.READ, subject: SUBJECTS.BENEFICIARY })
  @UseGuards(JwtGuard, AbilitiesGuard)
  async exportBeneficiariesCsv(
    @Body() dto: ExportBeneficiaryDateRangeDto,
    @Res() res: Response,
  ) {
    const { buffer, metadata } = await this.exportService.generateCsvExport(
      'beneficiary-csv',
      dto,
    );

    const filename = `${metadata.groupName}-beneficiaries.csv`;
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  }

  /**
   * Export group beneficiaries to an external app (rahat-platform).
   * Generates CSV, uploads to R2, and sends a signed callback to appURL.
   */
  @Post('beneficiaries/app')
  @HttpCode(HttpStatus.OK)
  @CheckAbilities({ actions: ACTIONS.CREATE, subject: SUBJECTS.TARGET })
  @UseGuards(JwtGuard, AbilitiesGuard)
  exportBeneficiariesToApp(@Body() dto: ExportToAppDto) {
    return this.exportService.queueExport('beneficiary', dto);
  }
}
