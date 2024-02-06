import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../constants';
import { TargetService } from '../target/target.service';

@Injectable()
export class ListenerService {
  constructor(private targetService: TargetService) {}
  @OnEvent(EVENTS.CREATE_TARGET_RESULT)
  async createTargetResult(data: any) {
    return await this.targetService.saveTargetResult(data);
  }
}
