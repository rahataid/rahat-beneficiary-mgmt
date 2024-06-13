import { Injectable } from '@nestjs/common';
import { FilterBeneficiaryByLocationDto } from '@rahataid/community-tool-extensions';
import { REPORTING_FIELD } from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';
import { SettingsService } from '@rumsan/settings';
import axios from 'axios';
import { KOBO_URL } from '../constants';
import { BeneficiariesService } from './beneficiaries/beneficiaries.service';
import {
  calculateBankStats,
  calculateExtraFieldStats,
  calculateHHGenderStats,
  calculateMapStats,
  calculatePhoneStats,
  calculateQualifiedSSA,
  calculateTotalBenef,
  calculateTotalWithAgeGroup,
  calculateTotalWithGender,
  calculateVulnerabilityStatus,
  totalVulnerableHH,
} from './beneficiaries/helpers';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private benefService: BeneficiariesService,
  ) {}

  async calculateStats(beneficiaries: any[]) {
    const [
      map_stats,
      total_benef,
      total_with_gender,
      total_by_agegroup,
      vulnerabiilty_status,
      total_vulnerable_hh,
      caste_stats,
      govt_id_type_stats,
      bank_name_stats,
      hh_education_stats,
      vulnerability_category_stats,
      phone_set_stats,
      phone_stats,
      bank_stats,
      ssa_not_received_stats,
      hh_gender_stats,
    ] = await Promise.all([
      calculateMapStats(beneficiaries),
      calculateTotalBenef(beneficiaries),
      calculateTotalWithGender(beneficiaries),
      calculateTotalWithAgeGroup(beneficiaries),
      calculateVulnerabilityStatus(beneficiaries),
      totalVulnerableHH(beneficiaries),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.CASTE,
        'CASTE_STATS',
      ),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.HH_GOVT_ID_TYPE,
        'GOVT_ID_TYPE_STATS',
      ),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.BANK_NAME,
        'BANK_NAME_STATS',
      ),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.HH_EDUCATION,
        'EDUCATION_STATS',
      ),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.VULNERABILITY_CATEGORY,
        'VULNERABILITY_CATEGORY_STATS',
      ),
      calculateExtraFieldStats(
        beneficiaries,
        REPORTING_FIELD.TYPE_OF_PHONE_SET,
        'PHONE_TYPE_STATS',
      ),
      calculatePhoneStats(beneficiaries),
      calculateBankStats(beneficiaries),
      calculateQualifiedSSA(beneficiaries),
      calculateHHGenderStats(beneficiaries),
    ]);

    return [
      map_stats,
      total_benef,
      total_with_gender,
      total_by_agegroup,
      vulnerabiilty_status,
      total_vulnerable_hh,
      caste_stats,
      govt_id_type_stats,
      bank_name_stats,
      hh_education_stats,
      vulnerability_category_stats,
      phone_set_stats,
      phone_stats,
      bank_stats,
      ssa_not_received_stats,
      hh_gender_stats,
    ];
  }

  async getStats(query: FilterBeneficiaryByLocationDto) {
    const benef = await this.benefService.findByPalikaAndWard(query);
    return this.calculateStats(benef);
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
