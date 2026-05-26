import { Logger } from '@nestjs/common';
import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';

@Processor(QUEUE.BENEFICIARY)
export class BeneficiaryProcessor {
  private readonly logger = new Logger(BeneficiaryProcessor.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private benefImportService: BeneficiaryImportService,
  ) {}

  /**
   * Import job: call the import service DIRECTLY and await it.
   * The job is only marked complete once the import finishes (or throws).
   * This means Bull's retry logic works correctly — a crash or error will
   * trigger a retry rather than silently completing the job.
   */
  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(
    job: Job<{ sourceUUID: string; groupName?: string }>,
  ) {
    this.logger.log(
      `Processing import job. jobId=${job.id}, sourceUUID=${job.data.sourceUUID}, groupName=${job.data.groupName}`,
    );
    await this.benefImportService.importBySourceUUID(
      job.data.sourceUUID,
      job.data.groupName,
    );
  }

  @Process(JOBS.BENEFICIARY.EXPORT)
  async exportBeneficiary(job: Job<unknown>) {
    this.logger.log(`Processing ${job.name}`);
    this.eventEmitter.emit(EVENTS.BENEF_EXPORT, job.data);
  }

  @Process(JOBS.BENEFICIARY.EXPORT_V2)
  async exportBeneficiaryV2(job: Job<unknown>) {
    this.logger.log(`Processing ${job.name}`);
    this.eventEmitter.emit(EVENTS.BENEF_EXPORT_V2, job.data);
  }

  @Process(JOBS.CREATE_BENEF_GROUP)
  async createBeneficiaryGroup(job: Job<unknown>) {
    this.logger.log(`Processing ${job.name}`);
    this.eventEmitter.emit(EVENTS.CREATE_BENEF_GROUP, job.data);
  }

  @OnQueueCompleted()
  onJobCompleted(job: Job) {
    this.logger.log(`Completed job. name=${job.name}, jobId=${job.id}`);
  }

  @OnQueueFailed()
  onJobFailed(job: Job, error: Error) {
    this.logger.error(
      `Job failed. name=${job.name}, jobId=${job.id}, attempt=${job.attemptsMade}, error=${error.message}`,
    );
  }
}
