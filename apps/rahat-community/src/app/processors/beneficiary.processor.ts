import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { exportBulkBeneficiary } from '../targets/helpers';

@Processor(QUEUE.BENEFICIARY)
export class BeneficiaryProcessor {
  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.BENEF_SOURCE_CREATED, job.data);
  }

  @Process(JOBS.BENEFICIARY.EXPORT)
  async exportBeneficiary(job: Job<any>) {
    const { data } = job;
    const { apiUrl, ...rest } = data;
    const buffer = Buffer.from(JSON.stringify(rest));
    return exportBulkBeneficiary(apiUrl, buffer);
  }

  @OnQueueCompleted()
  onJobCompleted(job: Job) {
    console.log('✅ Completed:', job.name);
  }
}
