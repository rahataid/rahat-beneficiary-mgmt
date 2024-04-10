import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TEMPLATES, EVENTS } from '../../constants';
import { TargetService } from '../targets/target.service';
import { BeneficiaryImportService } from '../beneficiary-import/beneficiary-import.service';
import { SourceCreatedDto } from './listeners.dto';
import { EmailService } from './mail.service';
import { BQUEUE, BeneficiaryEvents } from '@community-tool/sdk';
import { BeneficiaryStatService } from '../beneficiaries/beneficiaryStats.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
@Injectable()
export class ListenerService {
  constructor(
    @InjectQueue(BQUEUE.COMMUNITY_BENEFICIARY) private readonly queue: Queue,

    private targetService: TargetService,
    private benefImport: BeneficiaryImportService,
    private emailService: EmailService,
    private readonly benStats: BeneficiaryStatService,
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
    console.log('EMAIL Payload==>', payload);
    return this.emailService.sendEmail(
      data.address,
      'OTP for login',
      'OTP for login',
      `<h1>OTP for login</h1><p>${data.otp}</p>`,
    );
    // const sent = await this.mailService.sendOTPMail(payload);
    // console.log('Email Sent==>', sent);
  }

  @OnEvent(EVENTS.CLEANUP_TARGET_QUERY)
  async cleanupTargetQuery() {
    return this.targetService.cleanTargetQueryAndResults();
  }

  @OnEvent(EVENTS.BENEF_SOURCE_CREATED)
  async importBeneficiaries(data: SourceCreatedDto) {
    return this.benefImport.importBySourceUUID(data.sourceUUID);
  }

  @OnEvent(BeneficiaryEvents.BENEFICIARY_CREATED)
  @OnEvent(BeneficiaryEvents.BENEFICIARY_UPDATED)
  @OnEvent(BeneficiaryEvents.BENEFICIARY_REMOVED)
  async onBeneficiaryChanged() {
    console.log('listener called');
    await this.benStats.saveAllStats();
  }
}
