import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../constants';
import { TargetService } from '../targets/target.service';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';
import { SourceCreatedDto } from './listeners.dto';

@Injectable()
export class ListenerService {
  constructor(
    private targetService: TargetService,
    private benefImport: BeneficiaryImportService,
  ) {}
  @OnEvent(EVENTS.CREATE_TARGET_RESULT)
  async createTargetResult(data: any) {
    return await this.targetService.saveTargetResult(data);
  }

  @OnEvent(EVENTS.CLEANUP_TARGET_QUERY)
  async cleanupTargetQuery() {
    return this.targetService.cleanTargetQueryAndResults();
  }

  @OnEvent(EVENTS.BENEF_SOURCE_CREATED)
  async importBeneficiaries(data: SourceCreatedDto) {
    return this.benefImport.importBySourceUUID(data.sourceUUID);
  }
}
