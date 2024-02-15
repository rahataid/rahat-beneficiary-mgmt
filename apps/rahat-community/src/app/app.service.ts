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
    const data = getSetting(name);
    const koboid = data.URLID;
    const tokenid = data.AUTHTOKEN;
    const response = await axios.get(`${KOBO_URL}/${koboid}/data.json`, {
      headers: {
        Authorization: `Token ${tokenid}`,
      },
    });

    return response;
  }
}
