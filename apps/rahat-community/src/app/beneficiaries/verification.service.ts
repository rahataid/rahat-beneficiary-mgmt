import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerificationSignatureDTO } from '@rahataid/community-tool-extensions';
import {
  BQUEUE,
  JOBS,
  VERIFICATION_ADDRESS_SETTINGS_NAME,
} from '@rahataid/community-tool-sdk';
// import { ClientProxy } from '@nestjs/microservices';

import { PrismaService } from '@rumsan/prisma';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { recoverMessageAddress } from 'viem';

const HEX_CHAR = '0123456789ABCDEF0123456789ABCDEF';

@Injectable()
export class VerificationService {
  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService,
    @InjectQueue(BQUEUE.COMMUNITY_BENEFICIARY)
    private readonly beneficiaryQueue: Queue,
  ) {}
  private readonly algorithm = 'aes-256-cbc';
  private readonly privateKey = this.configService.get('PRIVATE_KEY');
  private iv = Buffer.from(HEX_CHAR, 'hex');

  getSecret = () => {
    if (!this.privateKey) {
      throw new Error('No PRIVATE_KEY found in config file');
    }
    const hash = crypto.createHash('sha256');
    hash.update(this.privateKey);
    return hash.digest('hex').split('').slice(0, 32).join('');
  };
  // Encryption function
  encrypt(data) {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.getSecret()),
      this.iv,
    );
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
  }

  // Decryption function
  decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.getSecret()),
      this.iv,
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getVerificationApp() {
    return this.prisma.setting.findFirst({
      where: {
        name: VERIFICATION_ADDRESS_SETTINGS_NAME,
      },
      select: {
        value: true,
      },
    });
  }

  async generateLink(uuid: string) {
    const verificationApp = await this.getVerificationApp();
    if (!verificationApp)
      throw new Error('Please setup verification app first!');

    const baseUrl = Object.values(verificationApp.value).find((v) => v);
    const benefDetails = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        walletAddress: true,
      },
    });
    if (!benefDetails.email) throw new Error('Email address not found');
    const encrypted = this.encrypt(benefDetails.walletAddress);
    const email = benefDetails.email;
    const name = `${benefDetails.firstName} ${benefDetails.lastName}`;
    await this.beneficiaryQueue.add(JOBS.SEND_EMAIL, {
      encrypted,
      email,
      name,
      baseUrl,
    });
    return 'Success';
  }

  async setBeneficiaryAsVerified(walletAddress: string) {
    const ben = await this.prisma.beneficiary.findFirst({
      where: { walletAddress },
    });
    if (!ben) throw new Error('Data not Found');

    return this.prisma.beneficiary.update({
      where: { uuid: ben.uuid },
      data: {
        isVerified: true,
      },
    });
  }

  async verifySignature(verificationData: VerificationSignatureDTO) {
    const { encryptedData, signature } = verificationData;
    const decryptedData = this.decrypt(encryptedData);
    const recoverAddress = await recoverMessageAddress({
      message: encryptedData,
      signature,
    });

    if (recoverAddress !== decryptedData) {
      throw new Error('Wallet Not Verified');
    }

    return this.setBeneficiaryAsVerified(decryptedData);
  }
}
