import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rahat/prisma';
import axios from 'axios';
import { getSetting } from './settings/setting.config';
import { KOBO_URL } from '../constants';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getData() {
    // const d = await this.prisma.;
    return { message: 'Hello API' };
  }

  async getDataFromKoboTool(name: string) {
    const settings = getSetting(name);
    if (!settings) throw new Error('Setting not found');
    const formId = settings.FORMID;
    const tokenId = settings.TOKENID;
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
              path: ['data', 'TYPE'],
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
        formId: item.value.data.FORMID,
      };
    });
    return sanitized;
  }
}
