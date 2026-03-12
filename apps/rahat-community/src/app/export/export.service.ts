import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOBS, QUEUE, QUEUE_RETRY_OPTIONS } from '../../constants';
import { BeneficiaryExportStrategy } from './strategies/beneficiary-export.strategy';
import { BeneficiaryCsvExportStrategy } from './strategies/beneficiary-csv-export.strategy';
import { ExportStrategy } from './strategies/export-strategy.interface';

export type ExportType = 'beneficiary' | 'beneficiary-csv';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly strategies: Record<ExportType, ExportStrategy>;

  constructor(
    @InjectQueue(QUEUE.BENEFICIARY) private readonly benefQueue: Queue,
    private readonly beneficiaryExportStrategy: BeneficiaryExportStrategy,
    private readonly beneficiaryCsvExportStrategy: BeneficiaryCsvExportStrategy,
  ) {
    this.strategies = {
      beneficiary: this.beneficiaryExportStrategy,
      'beneficiary-csv': this.beneficiaryCsvExportStrategy,
    };
  }

  async queueExport(type: ExportType, dto: any) {
    const strategy = this.getStrategy(type);

    // Validate the data exists before queuing
    await strategy.prepare(dto);

    await this.benefQueue.add(
      JOBS.BENEFICIARY.EXPORT_V2,
      { type, ...dto },
      QUEUE_RETRY_OPTIONS,
    );

    return {
      success: true,
      message: `Export (${type}) queued successfully!`,
    };
  }

  async processExport(type: ExportType, dto: any) {
    const strategy = this.getStrategy(type);

    this.logger.log(`Processing ${type} export`);
    const { data, metadata } = await strategy.prepare(dto);

    this.logger.log(`Generating export file`);
    const buffer = strategy.generate(data);

    this.logger.log(`Storing export file`);
    const storeResult = await strategy.store(buffer, metadata);

    this.logger.log(`Sending notification`);
    await strategy.notify(storeResult, metadata);

    this.logger.log(`Export (${type}) completed`);
  }

  /**
   * Generate and return CSV buffer directly (synchronous, no queue).
   * Used for direct CSV download endpoints.
   */
  async generateCsvExport(type: ExportType, dto: any): Promise<{ buffer: Buffer; metadata: Record<string, any> }> {
    const strategy = this.getStrategy(type);

    this.logger.log(`Generating CSV for ${type} export`);
    const { data, metadata } = await strategy.prepare(dto);
    const buffer = strategy.generate(data);

    return { buffer, metadata };
  }

  private getStrategy(type: ExportType): ExportStrategy {
    const strategy = this.strategies[type];
    if (!strategy) {
      throw new Error(`Unknown export type: ${type}`);
    }
    return strategy;
  }
}
