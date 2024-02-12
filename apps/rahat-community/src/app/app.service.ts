import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@rahat/prisma';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async getData() {
    // const d = await this.prisma.;
    return { message: 'Hello API' };
  }

  async rgetDataFromKoboTool() {
    const KOBO_URL = this.config.get('KOBO_URL');
    const AUTH_TOKEN_KOBO = this.config.get('AUTH_TOKEN');
    const response = await axios.get(KOBO_URL, {
      headers: {
        Authorization: `Token ${AUTH_TOKEN_KOBO}`,
      },
    });

    return response;
  }
}
