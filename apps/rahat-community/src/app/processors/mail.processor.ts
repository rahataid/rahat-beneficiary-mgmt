import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BQUEUE, JOBS } from '@rahataid/community-tool-sdk';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Processor(BQUEUE.COMMUNITY_BENEFICIARY)
export class MailProcessor {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  @Process(JOBS.SEND_EMAIL)
  async generateLink(job: Job) {
    const { data } = job;
    console.log('EMail Data=>', data);
    if (data) {
      return this.mailerService.sendMail({
        to: data.email,
        from: this.configService.get('SMTP_USERNAME'),
        subject: 'Wallet Verification Link',
        template: './wallet-verification',
        context: {
          url: `${data.baseUrl}?encrypted=${data.encrypted}`,
          name: data.name,
        },
      });
    }
  }
}
