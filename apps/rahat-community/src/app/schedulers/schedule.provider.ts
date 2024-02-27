import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EVENTS } from '../../constants';

@Injectable()
export class ScheduleService {
  constructor(private eventEmitter: EventEmitter2) {}
  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  cleanupTargetQuery() {
    this.eventEmitter.emit(EVENTS.CLEANUP_TARGET_QUERY, {});
  }
}
