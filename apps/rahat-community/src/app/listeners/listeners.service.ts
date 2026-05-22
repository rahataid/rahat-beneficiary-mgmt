import { BeneficiaryEvents } from '@rahataid/community-tool-sdk';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TEMPLATES, EVENTS } from '../../constants';
import { BeneficiaryStatService } from '../beneficiaries/beneficiaryStats.service';
import { TargetService } from '../targets/target.service';
import { EmailService } from './mail.service';
import {
  CreateBeneficiaryGroupDto,
  ExportTargetBeneficiaryDto,
} from '@rahataid/community-tool-extensions';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { ExportService } from '../export/export.service';

@Injectable()
export class ListenerService {
  constructor(
    private targetService: TargetService,
    private emailService: EmailService,
    private benefGroupService: BeneficiaryGroupService,
    private readonly benStats: BeneficiaryStatService,
    private readonly exportService: ExportService,
  ) {}

  @OnEvent(EVENTS.CREATE_TARGET_RESULT)
  async createTargetResult(data: any) {
    return await this.targetService.saveTargetResult(data);
  }

  @OnEvent(EVENTS.OTP_CREATED)
  async sendOTPEmail(data: any) {
    const payload = {
      name: data.name,
      otp: data.otp,
      to: data.address,
      subject: 'Rahat OTP',
      template: EMAIL_TEMPLATES.LOGIN,
    };
    return this.emailService.sendEmail(
      data.address,
      'OTP for login',
      'OTP for login',
      `<h1>OTP for login</h1><p>${data.otp}</p>`,
    );
  }

  @OnEvent(EVENTS.CLEANUP_TARGET_QUERY)
  async cleanupTargetQuery() {
    return this.targetService.cleanTargetQueryAndResults();
  }

  @OnEvent(EVENTS.BENEF_EXPORT)
  async exportBeneficiaries(data: ExportTargetBeneficiaryDto) {
    return this.targetService.processExportTarget(data);
  }

  @OnEvent(EVENTS.BENEF_EXPORT_V2)
  async exportBeneficiariesV2(data: ExportTargetBeneficiaryDto) {
    return this.exportService.processExport('beneficiary', data);
  }

  @OnEvent(EVENTS.CREATE_BENEF_GROUP)
  async createBenefGroup(data: CreateBeneficiaryGroupDto) {
    return this.benefGroupService.createBeneficiaryGroup(data);
  }

  @OnEvent(BeneficiaryEvents.BENEFICIARY_CREATED)
  @OnEvent(BeneficiaryEvents.BENEFICIARY_UPDATED)
  @OnEvent(BeneficiaryEvents.BENEFICIARY_REMOVED)
  async onBeneficiaryChanged() {
    // Reserved for stats recalculation when needed
    // await this.benStats.saveAllStats();
  }
}

