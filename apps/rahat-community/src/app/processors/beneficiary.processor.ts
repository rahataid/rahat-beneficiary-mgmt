import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.BENEFICIARY.IMPORT)
export class BeneficiaryProcessor {
  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.BENEF_SOURCE_CREATED, job.data);
  }

  @OnQueueCompleted()
  onJobCompleted(job: Job) {
    console.log('✅ Completed:', job.name);
  }
}
