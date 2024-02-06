import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JOBS, QUEUE } from '../../constants';

@Processor(QUEUE.TARGETING)
export class TargetProcessor {
  constructor() {}

  @Process(JOBS.TARGET_BENEFICIARY)
  async targetBeneficiary(job: Job<any>) {
    console.log('Job in action: ', job.data);
    // Trigger event to process target query
  }
}
