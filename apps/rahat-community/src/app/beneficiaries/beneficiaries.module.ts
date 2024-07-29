import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '@rumsan/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { BullModule } from '@nestjs/bull';
import { BQUEUE } from '@rahataid/community-tool-sdk';
import { StatsModule } from '@rahataid/community-tool-stats';
import { BeneficiaryStatService } from './beneficiaryStats.service';
import { BeneficiaryGroupModule } from '../beneficiary-groups/beneficiary-group.module';
import { VerificationService } from './verification.service';
import { MailProcessor } from '../processors';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { LogModule } from '../auditLog/log.module';
// import { LogService } from '../auditLog/log.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: BQUEUE.COMMUNITY_BENEFICIARY,
    }),
    StatsModule,
    BeneficiaryGroupModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: true,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
        },
        // defaults: { from: '"No Reply" <no-reply@rumsan.com>' },
        template: {
          dir: __dirname + '/assets/email-templates',
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  controllers: [BeneficiariesController],
  providers: [
    BeneficiariesService,
    PrismaService,
    FieldDefinitionsService,
    BeneficiaryStatService,
    MailProcessor,
    VerificationService,

    // LogService,
  ],
  exports: [BeneficiariesService, VerificationService],
})
export class BeneficiariesModule {}
