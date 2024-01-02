import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(manager: CreateManagerDto) {
    const findManager = await this.prisma.communityManager.findFirst({
      where: {
        walletAddress: manager?.walletAddress,
      },
    });
    if (findManager === null) {
      return await this.prisma.communityManager.create({
        data: {
          name: manager.name,
          email: manager.email,
          phone: manager.phone.toString(),
          walletAddress: manager.walletAddress,
          communities: manager.communities,
        },
      });
    } else {
      return await this.prisma.communityManager.update({
        where: {
          id: findManager?.id,
        },
        data: {
          communities: {
            push: manager?.communities,
          },
        },
      });
    }
  }

  findAll(query: any) {
    console.log(query);
    const where: Prisma.CommunityManagerWhereInput = {};

    const select: Prisma.CommunityManagerSelect = {
      communities: true,
      email: true,
      id: true,
      name: true,
      phone: true,
      walletAddress: true,
      createdAt: true,
    };

    const orderBy: Prisma.CommunityManagerOrderByWithRelationInput = {
      name: 'asc',
    };

    return paginate(
      this.prisma.communityManager,
      { where, select, orderBy },
      { page: query.page, perPage: query.perPage },
    );
  }

  async findOne(address: string, query: any) {
    const where: Prisma.CommunityManagerWhereInput = {
      communities: {
        has: address,
      },
    };

    const orderBy: Prisma.CommunityManagerOrderByWithRelationInput = {
      createdAt: 'asc',
    };

    return paginate(
      this.prisma.communityManager,
      { where, orderBy },
      { page: query.page, perPage: query.perPage },
    );
  }

  async update(updateManagerDto: UpdateManagerDto) {
    return 'Update manager';
  }

  remove(id: number) {
    return `This action removes a #${id} manager`;
  }
}
