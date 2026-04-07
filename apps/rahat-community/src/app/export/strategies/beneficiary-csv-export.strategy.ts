import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { ExportStrategy } from './export-strategy.interface';
import { generateCsvBuffer } from '../helpers/csv-generator.helper';
import { GroupService } from '../../groups/group.service';

/**
 * Strategy for exporting group beneficiaries as a downloadable CSV.
 * Supports optional date-range filtering on beneficiary createdAt.
 * Does not upload to R2 or send callbacks — returns the CSV buffer directly.
 */
@Injectable()
export class BeneficiaryCsvExportStrategy implements ExportStrategy {
  private readonly logger = new Logger(BeneficiaryCsvExportStrategy.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly groupService: GroupService,
  ) {}

  async prepare(params: {
    groupUUID: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { groupUUID, startDate, endDate } = params;
    const group = await this.groupService.findUnique(groupUUID);
    if (!group) throw new Error('Group not found');

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const rows = await this.prismaService.beneficiaryGroup.findMany({
      where: {
        groupUID: group.uuid,
        ...(Object.keys(dateFilter).length > 0
          ? { beneficiary: { createdAt: dateFilter } }
          : {}),
      },
      include: { beneficiary: true },
    });
    if (!rows.length) throw new Error('No beneficiaries found for this group');

    const beneficiaries = rows.map((r: any) => r.beneficiary);
    this.logger.log(
      `Fetched ${beneficiaries.length} beneficiaries for CSV export`,
    );

    return {
      data: beneficiaries,
      metadata: {
        groupName: group.name,
        groupUUID: group.uuid,
        beneficiaryCount: beneficiaries.length,
        startDate,
        endDate,
      },
    };
  }

  generate(data: any[]): Buffer {
    return generateCsvBuffer(data);
  }

  async store(
    buffer: Buffer,
    metadata: Record<string, any>,
  ): Promise<{ key: string; url: string }> {
    // No remote storage — CSV is returned directly to the client
    return { key: '', url: '' };
  }

  async notify(
    storeResult: { key: string; url: string },
    metadata: Record<string, any>,
  ): Promise<void> {
    // No callback needed for direct CSV downloads
  }
}
