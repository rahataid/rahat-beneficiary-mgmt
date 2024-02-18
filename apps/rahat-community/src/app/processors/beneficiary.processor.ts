import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.BENEFICIARY.IMPORT)
export class BeneficiaryProcessor {
  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.BENEFICIARY.IMPORT)
  async importBeneficiary(job: Job<any>) {
    console.log('JOB==>', job);
  }
}
