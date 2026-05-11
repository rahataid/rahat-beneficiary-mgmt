import { Logger } from '@nestjs/common';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.BENEFICIARY)
export class BeneficiaryProcessor {
  private readonly logger = new Logger(BeneficiaryProcessor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(job: Job<unknown>) {
    this.logger.log(`Processing ${job.name}`);
    this.eventEmitter.emit(EVENTS.BENEF_SOURCE_CREATED, job.data);
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
    this.logger.log(`Completed ${job.name}`);
  }
}
