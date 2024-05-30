import { StatsService } from '@rahataid/community-tool-stats';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import {
  REPORTING_FIELD,
  VALID_AGE_GROUP_KEYS,
} from '@rahataid/community-tool-sdk';
import {
  bankedUnbankedMapping,
  mapSentenceCountFromArray,
  mapVulnerabilityStatusCount,
  phoneUnphonedMapping,
} from './helpers';

const {
  NO_OF_MALE,
  NO_OF_FEMALE,
  OTHERS,
  TYPES_OF_SSA_TO_BE_RECEIVED,
  TYPE_OF_SSA_1,
  TYPE_OF_SSA_2,
  TYPE_OF_SSA_3,
  HOW_MANY_LACTATING,
  HOW_MANY_PREGNANT,
} = REPORTING_FIELD;

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
    const result = Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
    return result.filter((f) => f.id.toLocaleUpperCase() !== 'NO');
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
    let myData = {};
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    for (let item of data) {
      const d = item.extras;
      if (d && d[NO_OF_MALE]) {
        if (myData[NO_OF_FEMALE]) {
          myData[NO_OF_FEMALE] += 1;
        } else myData[NO_OF_FEMALE] = 1;
      }
      if (d && d[NO_OF_MALE]) {
        if (myData[NO_OF_MALE]) {
          myData[NO_OF_MALE] += 1;
        } else myData[NO_OF_MALE] = 1;
      }
      if (d && d[OTHERS]) {
        if (myData[OTHERS]) {
          myData[OTHERS] += 1;
        } else myData[OTHERS] = 1;
      }
    }
    return Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
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
      if (extras[TYPES_OF_SSA_TO_BE_RECEIVED])
        ssa_data.push(extras[TYPES_OF_SSA_TO_BE_RECEIVED]);
    }
    const mapped = mapSentenceCountFromArray(ssa_data);
    return mapped.filter((f) => f.id.toUpperCase() !== 'NO');
  }

  async calculateBankStats() {
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    const myData = bankedUnbankedMapping(data);
    const result = Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
    return result;
  }

  async calculatePhoneStats() {
    const data = await this.prisma.beneficiary.findMany({
      select: { phone: true },
    });
    if (!data.length) return [];
    let myData = phoneUnphonedMapping(data);
    return Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
  }

  async calculateTotalVulnerableHouseHold() {
    let countData = 0;
    let nonCountData = [];
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    for (let d of data) {
      const { extras } = d;
      if (extras[TYPE_OF_SSA_1]) nonCountData.push(TYPE_OF_SSA_1);
      if (extras[TYPE_OF_SSA_2]) nonCountData.push(TYPE_OF_SSA_2);
      if (extras[TYPE_OF_SSA_3]) nonCountData.push(TYPE_OF_SSA_3);
      if (extras[TYPES_OF_SSA_TO_BE_RECEIVED])
        nonCountData.push(TYPES_OF_SSA_TO_BE_RECEIVED);
      if (extras[HOW_MANY_LACTATING]) countData += +extras[HOW_MANY_LACTATING];
      if (extras[HOW_MANY_PREGNANT]) countData += +extras[HOW_MANY_PREGNANT];
    }

    return nonCountData.length + countData;
  }

  async calculateVulnerabilityStatus() {
    const data = await this.findBeneficiaryExtras();
    if (!data.length) return [];
    let myData = mapVulnerabilityStatusCount(data);
    return Object.keys(myData).map((d) => ({
      id: d,
      count: myData[d],
    }));
  }

  async calculateAllStats() {
    const [
      gender,
      bankedStatus,
      internetStatus,
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      phoneTypeStats,
      bankStatus,
      phoneStats,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
      totalVulnerableHousehold,
      vulnerabilityStatus,
    ] = await Promise.all([
      this.calculateGenderStats(),
      this.calculateBankedStatusStats(),
      this.calculateInternetStatusStats(),
      this.totalBeneficiaries(),
      this.calculateExtrasStats(REPORTING_FIELD.CASTE),
      this.calculateExtrasStats(REPORTING_FIELD.BANK_NAME),
      this.calculateExtrasStats(REPORTING_FIELD.HH_GOVT_ID_TYPE),
      this.calculateExtrasStats(REPORTING_FIELD.HH_EDUCATION),
      this.calculateExtrasStats(REPORTING_FIELD.VULNERABILITY_CATEGORY),
      this.calculateExtrasStats(REPORTING_FIELD.TYPE_OF_PHONE_SET),
      this.calculateBankStats(),
      this.calculatePhoneStats(),
      this.calculateTotalWithGender(),
      this.calculateTotalByAgegroup(),
      this.calculateSSAStats(),
      this.calculateTotalVulnerableHouseHold(),
      this.calculateVulnerabilityStatus(),
    ]);

    return {
      gender,
      bankedStatus,
      internetStatus,
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      phoneTypeStats,
      bankStatus,
      phoneStats,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
      totalVulnerableHousehold,
      vulnerabilityStatus,
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
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      phoneTypeStats,
      bankStatus,
      phoneStats,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
      totalVulnerableHousehold,
      vulnerabilityStatus,
    } = await this.calculateAllStats();

    await Promise.all([
      this.statsService.save({
        name: 'ssa_not_received_stats',
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
        data: totalWithGender,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'total_vulnerable_household',
        data: { count: totalVulnerableHousehold },
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
        name: 'phone_type_stats',
        data: phoneTypeStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_bank_stats',
        data: bankStatus,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'beneficiary_phone_stats',
        data: phoneStats,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'total_by_agegroup',
        data: totalByAgegroup,
        group: 'beneficiary',
      }),
      this.statsService.save({
        name: 'vulnerabiilty_status',
        data: vulnerabilityStatus,
        group: 'beneficiary',
      }),
    ]);

    return {
      gender,
      bankedStatus,
      internetStatus,
      total,
      castStats,
      bankNameStats,
      govtIdTypeStats,
      educationStats,
      vulnerabilityCategory,
      phoneTypeStats,
      bankStatus,
      phoneStats,
      totalWithGender,
      totalByAgegroup,
      ssaStats,
    };
  }
}
