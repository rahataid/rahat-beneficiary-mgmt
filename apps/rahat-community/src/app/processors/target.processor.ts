import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { JOBS, QUEUE, EVENTS } from '../../constants';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor(QUEUE.TARGETING)
export class TargetProcessor {
  private readonly logger = new Logger(TargetProcessor.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Process(JOBS.TARGET_BENEFICIARY)
  async targetBeneficiary(job: Job<any>) {
    const pickedAt = Date.now();
    const queued = pickedAt - job.timestamp;
    // timing info travels with the event so saveTargetResult can log queued/endToEnd
    this.eventEmitter.emit(EVENTS.CREATE_TARGET_RESULT, {
      ...job.data,
      _timing: { enqueuedAt: job.timestamp, pickedAt },
    });
    // NOTE: emit() does not wait for the listener, so this job is marked
    // "completed" here while saveTargetResult is still running.
    this.logger.log(
      `[timing] job target=${job.data?.targetUuid} attempt=${
        job.attemptsMade + 1
      } ` +
        `queued=${queued}ms jobReturnedAfter=${
          Date.now() - pickedAt
        }ms (work continues in listener)`,
    );
  }
}
