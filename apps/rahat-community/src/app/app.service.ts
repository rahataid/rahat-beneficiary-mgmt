import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async getData() {
    const d = await this.prisma.category.findMany();
    return { message: 'Hello API', data: d };
  }
}
