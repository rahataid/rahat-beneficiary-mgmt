import { StatsService } from '@rahataid/community-tool-stats';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import {
  REPORTING_FIELD,
  VALID_AGE_GROUP_KEYS,
} from '@rahataid/community-tool-sdk';
import { mapSentenceCountFromArray } from './helpers';

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

  async calculateExtrasStats(fieldName: string) {
    const data = await this.prisma.beneficiary.findMany({
      where: {
        extras: { path: [fieldName], not: null },
      },
      select: { extras: true },
    });
    if (!data) return [];
    const myData = {};
    // Calculate count for each value
    data.forEach((item: any) => {
      const value = item.extras[fieldName];
      if (myData[value]) {
        myData[value] += 1;
      } else {
        myData[value] = 1;
      }
    });
    return Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
  }

  async totalBeneficiaries() {
    return { count: await this.prisma.beneficiary.count() };
  }

  async findBeneficiaryExtras() {
    return await this.prisma.beneficiary.findMany({
      select: { extras: true },
    });
  }

  async calculateTotalWithGender() {
    let total = 0;
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return total;
    for (let item of data) {
      const d = item.extras;
      if (d && d['no_of_male']) total += +d['no_of_male'];
      if (d && d['no_of_female']) total += +d['no_of_female'];
      if (d && d['others']) total += +d['others'];
    }
    return total;
  }

  async calculateTotalByAgegroup() {
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    const result = data.reduce((acc, obj) => {
      for (const [key, value] of Object.entries(obj.extras)) {
        if (VALID_AGE_GROUP_KEYS.includes(key)) {
          if (!acc[key]) {
            acc[key] = 0;
          }
          acc[key] += +value;
        }
      }
      return acc;
    }, {});

    const finalResult = Object.entries(result).map(([key, value]) => {
      return { id: key, count: value };
    });
    return finalResult;
  }

  async calculateSSAStats() {
    let ssa_data = [];
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    for (let d of data) {
      const { extras } = d as any;
      if (extras.types_of_ssa_to_be_received)
        ssa_data.push(extras.types_of_ssa_to_be_received);
    }
    const mapped = mapSentenceCountFromArray(ssa_data);
    return mapped.filter((f) => f.id.toLocaleUpperCase() !== 'NO');
  }

  async calculateAllStats() {
    const [
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
    ] = await Promise.all([
      this.calculateGenderStats(),
      this.calculateBankedStatusStats(),
      this.calculateInternetStatusStats(),
      this.calculatePhoneStatusStats(),
      this.totalBeneficiaries(),
      this.calculateExtrasStats(REPORTING_FIELD.CASTE),
      this.calculateExtrasStats(REPORTING_FIELD.BANK_NAME),
      this.calculateExtrasStats(REPORTING_FIELD.HH_GOVT_ID_TYPE),
      this.calculateExtrasStats(REPORTING_FIELD.HH_EDUCATION),
      this.calculateExtrasStats(REPORTING_FIELD.VULNERABILITY_CATEGORY),
      this.calculateTotalWithGender(),
      this.calculateTotalByAgegroup(),
      this.calculateSSAStats(),
    ]);

    return {
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
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
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
    } = await this.calculateAllStats();

    await Promise.all([
      this.statsService.save({
        name: 'ssa_recieved_stats',
        data: ssaStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_total',
        data: total,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'total_with_gender',
        data: { count: totalWithGender },
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
      this.statsService.save({
        name: 'bank_name_stats',
        data: bankNameStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'govt_id_type_stats',
        data: govtIdTypeStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'education_stats',
        data: educationStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'vulnerability_category_stats',
        data: vulnerabilityCategory,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'total_by_agegroup',
        data: totalByAgegroup,
        group: 'beneficiary',
      }),
    ]);

    return {
      gender,
      bankedStatus,
      internetStatus,
      phoneStatus,
      castStats,
      bankNameStats,
      total,
    };
  }
}
