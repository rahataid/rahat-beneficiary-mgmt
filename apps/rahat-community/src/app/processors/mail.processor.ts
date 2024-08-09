import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BQUEUE, JOBS } from '@rahataid/community-tool-sdk';
import { MailerService } from '@nestjs-modules/mailer';

@Processor(BQUEUE.COMMUNITY_BENEFICIARY)
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process(JOBS.SEND_EMAIL)
  async generateLink(job: Job) {
    const { data } = job;
    const callBackUrl = `${process.env.APP_URL}/api/v1/beneficiaries/verify-signature`;
    if (data) {
      return this.mailerService.sendMail({
        to: data.email,
        from: process.env.SMTP_USERNAME,
        subject: 'Wallet Verification Link',
        template: './wallet-verification',
        context: {
          url: `${data.baseUrl}?encrypted=${data.encrypted}&callBackUrl=${callBackUrl}`,
          name: data.name,
        },
      });
    }
  }
}
