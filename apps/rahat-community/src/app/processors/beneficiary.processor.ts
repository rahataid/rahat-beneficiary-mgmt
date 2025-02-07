import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.BENEFICIARY)
export class BeneficiaryProcessor {
  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.BENEF_SOURCE_CREATED, job.data);
  }

  @Process(JOBS.BENEFICIARY.EXPORT)
  async exportBeneficiary(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.BENEF_EXPORT, job.data);
  }

  @Process(JOBS.CREATE_BENEF_GROUP)
  async createBeneficiaryGroup(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.CREATE_BENEF_GROUP, job.data);
  }

  @OnQueueCompleted()
  onJobCompleted(job: Job) {
    console.log('✅ Completed:', job.name);
  }
}
