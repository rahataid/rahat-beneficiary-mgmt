import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import axios from 'axios';
import { KOBO_URL } from '../constants';
import { SettingsService } from '@rumsan/settings';
import { BeneficiariesService } from './beneficiaries/beneficiaries.service';
import { FilterBeneficiaryByLocationDto } from '@rahataid/community-tool-extensions';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private benefService: BeneficiariesService,
  ) {}

  async getStats(query: FilterBeneficiaryByLocationDto) {
    // 1. Fetch benef by query
    const benef = await this.benefService.findByPalikaAndWard(query);
    // 2. Calculate stats
    // 3. Return stats
    return benef;
  }

  async getData() {
    // const d = await this.prisma.;
    return { message: 'Hello API' };
  }

  async getDataFromKoboTool(name: string) {
    const settings = SettingsService.get(name);
    if (!settings) throw new Error('Setting not found');
    const formId = settings.FORM_ID || '';
    const tokenId = settings.TOKEN_ID || '';
    return axios.get(`${KOBO_URL}/${formId}/data.json`, {
      headers: {
        Authorization: `Token ${tokenId}`,
      },
    });
  }

  // TODO: Move this to settings module
  async findKobotoolSettings() {
    const res: any[] = await this.prisma.setting.findMany({
      where: {
        AND: [
          {
            value: {
              path: ['TYPE'],
              string_contains: 'KOBOTOOL',
            },
          },
        ],
      },
      select: {
        name: true,

        value: true,
      },
    });
    if (!res.length) return [];
    const sanitized = res.map((item) => {
      return {
        name: item.name,
        formId: item.value.FORM_ID,
      };
    });
    return sanitized;
  }

  async getSettings() {
    const rData = await this.prisma.setting.findMany();
    return rData;
  }
}
