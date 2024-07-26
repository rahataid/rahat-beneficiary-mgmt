// email.service.ts

import { Injectable } from '@nestjs/common';
// import { SettingsService } from '@rumsan/settings';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private config: ConfigService) {}

  initialize() {
    if (!this.transporter) {
      console.log('Initializing email service');
      this.transporter = nodemailer.createTransport({
        pool: true,
        host: this.config.get('SMTP_HOST'),
        port: this.config.get('SMTP_PORT'),
        secure: true,
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASSWORD'),
        },
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    this.initialize();
    const mailOptions = {
      from: this.config.get('EMAIL_ADDRESS'), // Replace with your email
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Or handle it as per your application needs
    }
  }
}
