import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.TARGETING)
export class TargetProcessor {
  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.TARGET_BENEFICIARY)
  async targetBeneficiary(job: Job<any>) {
    this.eventEmitter.emit(EVENTS.CREATE_TARGET_RESULT, job.data);
  }
}
