import { StatsService } from '@rahataid/community-tool-stats';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class BeneficiaryStatService {
  constructor(
    protected prisma: PrismaService,
    private readonly statsService: StatsService,
  ) {}

  async calculateGenderStats() {
    const genderStats = await this.prisma.beneficiary.groupBy({
      by: ['gender'],
      _count: {
        gender: true,
      },
    });

    return genderStats.map((stat) => ({
      id: stat.gender,
      count: stat._count.gender,
    }));
  }

  async calculateBankedStatusStats() {
    const bankedStatusStats = await this.prisma.beneficiary.groupBy({
      by: ['bankedStatus'],
      _count: {
        bankedStatus: true,
      },
    });

    return bankedStatusStats.map((stat) => ({
      id: stat.bankedStatus,
      count: stat._count.bankedStatus,
    }));
  }

  async calculateInternetStatusStats() {
    const internetStatusStats = await this.prisma.beneficiary.groupBy({
      by: ['internetStatus'],
      _count: {
        internetStatus: true,
      },
    });

    return internetStatusStats.map((stat) => ({
      id: stat.internetStatus,
      count: stat._count.internetStatus,
    }));
  }

  async calculatePhoneStatusStats() {
    const phoneStatusStats = await this.prisma.beneficiary.groupBy({
      by: ['phoneStatus'],
      _count: {
        phoneStatus: true,
      },
    });

    return phoneStatusStats.map((stat) => ({
      id: stat.phoneStatus,
      count: stat._count.phoneStatus,
    }));
  }

  async calculateCasteStats() {
    const data = await this.prisma.beneficiary.findMany({
      where: {
        extras: { path: ['caste'], not: null },
      },
      select: { extras: true },
    });
    if (!data) return [];
    const casteCounts = {};
    data.forEach((item: any) => {
      const caste = item.extras?.caste || '';
      if (casteCounts[caste]) {
        casteCounts[caste] += 1;
      } else {
        casteCounts[caste] = 1;
      }
    });
    return Object.keys(casteCounts).map((caste) => ({
      id: caste,
      count: casteCounts[caste],
    }));
  }

  async totalBeneficiaries() {
    return { count: await this.prisma.beneficiary.count() };
  }

  async calculateAllStats() {
    const [
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      total,
      castStats,
    ] = await Promise.all([
      this.calculateGenderStats(),
      this.calculateBankedStatusStats(),
      this.calculateInternetStatusStats(),
      this.calculatePhoneStatusStats(),
      this.totalBeneficiaries(),
      this.calculateCasteStats(),
    ]);

    return {
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      total,
      castStats,
    };
  }

  async getAllStats(group = 'beneficiary') {
    return await this.statsService.getByGroup(group);
  }

  async getStatsByName(name: string) {
    return await this.statsService.findOne(name);
  }

  async saveAllStats() {
    const {
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      total,
      castStats,
    } = await this.calculateAllStats();

    await Promise.all([
      this.statsService.save({
        name: 'beneficiary_total',
        data: total,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_gender',
        data: gender,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_bankedStatus',
        data: bankedStatus,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_internetStatus',
        data: internetStatus,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_phoneStatus',
        data: phoneStatus,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'caste_stats',
        data: castStats,
        group: 'beneficiary',
      }),
    ]);

    return { gender, bankedStatus, internetStatus, phoneStatus };
  }
}
