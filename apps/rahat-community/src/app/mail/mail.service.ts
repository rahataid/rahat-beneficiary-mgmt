import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendOTPDto } from './dto';

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	async sendOTPMail(data: SendOTPDto) {
		await this.mailerService.sendMail({
			to: data.to,
			subject: data.subject || 'Subject not sent',
			template: data.template,
			context: {
				name: data.name,
				otp: data.otp,
			},
		});
	}
}
