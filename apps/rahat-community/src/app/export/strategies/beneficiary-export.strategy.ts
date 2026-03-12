import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { SETTINGS_NAMES } from '@rahataid/community-tool-sdk';
import { ExportStrategy } from './export-strategy.interface';
import { generateCsvBuffer } from '../helpers/csv-generator.helper';
import { uploadToR2 } from '../helpers/r2-upload.helper';
import {
  checkPublicKey,
  exportBulkBeneficiary,
  generateSignature,
} from '../helpers/signed-callback.helper';
import { getBaseUrl } from '../../utils';
import { GroupService } from '../../groups/group.service';

@Injectable()
export class BeneficiaryExportStrategy implements ExportStrategy {
  private readonly logger = new Logger(BeneficiaryExportStrategy.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly groupService: GroupService,
  ) {}

  async prepare(params: { groupUUID: string; appURL: string }) {
    const { groupUUID } = params;
    const group = await this.groupService.findUnique(groupUUID);
    if (!group) throw new Error('Group not found');

    const rows = await this.prismaService.beneficiaryGroup.findMany({
      where: { groupUID: group.uuid },
      include: { beneficiary: true },
    });
    if (!rows.length) throw new Error('No beneficiaries found for this group');

    const beneficiaries = rows.map((r: any) => r.beneficiary);
    this.logger.log(`Fetched ${beneficiaries.length} beneficiaries for export`);

    return {
      data: beneficiaries,
      metadata: {
        groupName: group.name,
        groupUUID: group.uuid,
        appURL: params.appURL,
        beneficiaryCount: beneficiaries.length,
      },
    };
  }

  generate(data: any[]): Buffer {
    return generateCsvBuffer(data);
  }

  async store(
    buffer: Buffer,
    metadata: Record<string, any>,
  ): Promise<{ key: string; url: string }> {
    const timestamp = Date.now();
    const r2Key = `exports/${metadata.groupUUID}/${timestamp}-${metadata.groupName}.csv`;
    this.logger.log(`Uploading CSV to R2 with key: ${r2Key}`);
    return uploadToR2(buffer, r2Key, 'text/csv');
  }

  async notify(
    storeResult: { key: string; url: string },
    metadata: Record<string, any>,
  ): Promise<void> {
    const { appURL } = metadata;
    const verified = await this.verifyPublicKey(appURL);

    const signature = await generateSignature(
      verified.nonceMessage,
      verified.privateKey,
    );

    const payload = {
      appUrl: appURL,
      signature,
      address: verified.address,
      data: {
        r2Key: storeResult.key,
        fileUrl: storeResult.url,
        groupName: metadata.groupName,
        groupUUID: metadata.groupUUID,
        beneficiaryCount: metadata.beneficiaryCount,
      },
    };

    this.logger.log('Sending signed callback to appURL');
    await exportBulkBeneficiary(payload);
  }

  private async verifyPublicKey(appUrl: string) {
    const settings = await this.prismaService.setting.findUnique({
      where: { name: SETTINGS_NAMES.APP_IDENTITY },
    });
    if (!settings) throw new Error('Please setup app identity first!');
    const settingsData: any = settings.value;
    const baseUrl = getBaseUrl(appUrl);
    const { ADDRESS, PRIVATE_KEY } = settingsData;
    const apiUrl = `${baseUrl}/v1/app/auth-apps/${ADDRESS}/identity`;
    const response: any = await checkPublicKey(apiUrl);
    if (!response || !response.data) throw new Error('Invalid app identity!');
    return { ...response.data, privateKey: PRIVATE_KEY };
  }
}
