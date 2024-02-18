import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rahat/prisma';
import axios from 'axios';
import { getSetting, listSettings } from './settings/setting.config';
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
    const response = await axios.get(`${KOBO_URL}/${formId}/data.json`, {
      headers: {
        Authorization: `Token ${tokenId}`,
      },
    });

    return response;
  }

  async filterSettingByType(typeName: string) {
    const listSettings = this.prisma.setting.findMany({
      where: {
        AND: [
          {
            value: {
              path: ['data', 'TYPE'],
              string_contains: typeName.toUpperCase(),
            },
          },
        ],
      },
      select: {
        name: true,
        id: true,
      },
    });
    return listSettings;
  }
}
