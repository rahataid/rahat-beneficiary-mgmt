import { Injectable } from '@nestjs/common';

import {
  BulkInsertDto,
  CreateBeneficiaryDto,
  FilterBeneficiaryByLocationDto,
  ListBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import XLSX from 'xlsx';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { validateAllowedFieldAndTypes } from '../field-definitions/helpers';
import { deleteFileFromDisk } from '../utils/multer';
import { paginate } from '../utils/paginate';
import { createSearchQuery, splitBenefName } from './helpers';

import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ArchiveType,
  BeneficiaryEvents,
  generateRandomWallet,
} from '@rahataid/community-tool-sdk';
import { DB_MODELS, DEFAULT_GROUP } from '../../constants';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import { convertDateToISO } from '../utils';

const TARGETS_PER_PAGE = 10000;

interface IDuplicateValidation {
  hasPhone: boolean;
  hasGovtID: boolean;
}

@Injectable()
export class BeneficiariesService {
  constructor(
    private prisma: PrismaService,
    private fieldDefService: FieldDefinitionsService,
    private eventEmitter: EventEmitter2,
    private beneficiaryGroupService: BeneficiaryGroupService,
  ) {}

  async findByLocation(location: string) {
    let query = {};
    if (location)
      query = { location: { equals: location, mode: 'insensitive' } };
    return this.prisma.beneficiary.findMany({
      where: query,
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        gender: true,
        location: true,
        latitude: true,
        longitude: true,
        internetStatus: true,
        extras: true,
      },
    });
  }

  async filterByWardNo(data: any[], ward_no: string) {
    let final_result = [];
    for (let d of data) {
      if (d.extras && d.extras['ward_no'] && d.extras['ward_no'] == ward_no) {
        final_result.push(d);
      }
    }
    return final_result;
  }

  async findByPalikaAndWard(query: FilterBeneficiaryByLocationDto) {
    const { location = null, ward_no } = query;
    const data = await this.findByLocation(location);
    if (!data.length) return [];
    if (ward_no) return this.filterByWardNo(data, ward_no);
    return data;
  }

  async fetchDBFields() {
    const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    if (!dbFields.length) return [];
    const scalarFields = dbFields.filter((f) => f.kind === 'scalar');
    const extraFields = dbFields.filter((f) => f.type.toLowerCase() === 'json');
    return { scalarFields, extraFields };
  }

  upsertToDefaultGroup({ tx, defaultGroupUID, benefUID }) {
    return tx.beneficiaryGroup.upsert({
      where: {
        benefGroupIdentifier: {
          beneficiaryUID: benefUID,
          groupUID: defaultGroupUID,
        },
      },
      update: {
        groupUID: defaultGroupUID,
        beneficiaryUID: benefUID,
      },
      create: {
        groupUID: defaultGroupUID,
        beneficiaryUID: benefUID,
      },
    });
  }

  upsertToImportGroup({ tx, importGroupUID, benefUID }) {
    return tx.beneficiaryGroup.upsert({
      where: {
        benefGroupIdentifier: {
          beneficiaryUID: benefUID,
          groupUID: importGroupUID,
        },
      },
      update: {
        groupUID: importGroupUID,
        beneficiaryUID: benefUID,
      },
      create: {
        groupUID: importGroupUID,
        beneficiaryUID: benefUID,
      },
    });
  }

  async addToGroups({ tx, benefUID, defaultGroupUID, importGroupUID }) {
    await this.upsertToDefaultGroup({ tx, defaultGroupUID, benefUID });
    await this.upsertToImportGroup({ tx, importGroupUID, benefUID });
  }

  async upsertByUUID({
    sourceUID,
    defaultGroupUID,
    importGroupUID,
    beneficiary,
  }) {
    if (beneficiary.birthDate) {
      beneficiary.birthDate = convertDateToISO(beneficiary.birthDate);
    }

    if (!beneficiary.walletAddress) {
      beneficiary.walletAddress = generateRandomWallet().address;
    }
    return this.prisma.$transaction(async (tx) => {
      const exist = await this.findOne(beneficiary.uuid);
      if (exist)
        await this.addBeneficiaryToArchive(tx, exist, ArchiveType.UPDATED);

      const res = await tx.beneficiary.upsert({
        where: { uuid: beneficiary.uuid },
        update: beneficiary,
        create: beneficiary,
      });

      await this.addToGroups({
        tx,
        benefUID: res.uuid,
        defaultGroupUID,
        importGroupUID,
      });

      return this.addBenefToSource(res.uuid, sourceUID, tx);
    });
  }

  async addBenefToSource(benefUID: string, sourceUID: string, tx: any) {
    const rData = await tx.beneficiarySource.findUnique({
      where: {
        benefSourceIdentifier: {
          beneficiaryUID: benefUID,
          sourceUID: sourceUID,
        },
      },
    });
    if (rData) return;
    return tx.beneficiarySource.create({
      data: {
        beneficiaryUID: benefUID,
        sourceUID: sourceUID,
      },
    });
  }

  async addBeneficiaryToArchive(tx: any, beneficiary: any, flag: ArchiveType) {
    beneficiary.archiveType = flag;
    return tx.beneficiaryArchive.upsert({
      where: { uuid: beneficiary.uuid },
      update: beneficiary,
      create: beneficiary,
    });
  }

  async findPhoneAndGovtID() {
    return this.prisma.beneficiary.findMany({
      where: {},
      select: {
        phone: true,
        govtIDNumber: true,
      },
    });
  }

  async checkDuplicatePhoneAndGovtID(
    phone: string,
    govtID: string,
  ): Promise<IDuplicateValidation> {
    const result = {
      hasPhone: false,
      hasGovtID: false,
    };
    const beneficiaries = await this.findPhoneAndGovtID();
    if (!beneficiaries.length) result;
    const existPhone = beneficiaries.find((f) => f.phone === phone);
    if (phone && existPhone) result.hasPhone = true;
    const existGovtId = beneficiaries.find((f) => f.govtIDNumber === govtID);
    if (govtID && existGovtId) result.hasGovtID = true;

    return result;
  }

  async create(dto: CreateBeneficiaryDto) {
    const { birthDate, extras, walletAddress } = dto;
    const { hasPhone, hasGovtID } = (await this.checkDuplicatePhoneAndGovtID(
      dto.phone,
      dto.govtIDNumber,
    )) as any;
    if (hasPhone) throw new Error('Phone number already exist!');
    if (hasGovtID) throw new Error('Govt. ID number already exist!');

    if (birthDate) dto.birthDate = convertDateToISO(birthDate);
    if (!walletAddress) dto.walletAddress = generateRandomWallet().address;

    if (extras && Object.keys(extras).length > 0) {
      const fields = await this.fieldDefService.listActive();
      if (!fields.length) throw new Error('Please setup allowed fields first!');
      const nonMatching = validateAllowedFieldAndTypes(extras, fields);
      if (nonMatching.length)
        throw new Error(
          `[${nonMatching.toString()}] field/type are not allowed inside extras!`,
        );
    }

    const benef = await this.prisma.beneficiary.create({
      data: {
        ...dto,
      },
    });
    if (benef) await this.addBenefToDefaultGroup(benef.uuid);
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);
    return benef;
  }

  async addBenefToDefaultGroup(beneficiary: string) {
    const payload = {
      name: DEFAULT_GROUP,
    };
    const group = await this.prisma.group.upsert({
      where: payload,
      update: payload,
      create: payload,
    });
    if (!group) return;
    return this.beneficiaryGroupService.upsertBeneficiaryGroup(
      beneficiary,
      group.uuid,
    );
  }

  async searchTargets(filters: any) {
    const search_conditions = createSearchQuery(filters);
    return paginate(
      this.prisma.beneficiary,
      { where: search_conditions },
      {
        page: +filters?.page,
        perPage: +filters?.perPage || TARGETS_PER_PAGE,
      },
    );
  }

  async filterConditions(filters: ListBeneficiaryDto) {
    // console.log(filters.location !== null);
    const OR_CONDITIONS = [];
    let conditions = {};

    const fields = await this.fieldDefService.listActive();
    const fieldNames = fields.map((f) => f.name);

    const keys = Object.keys(filters);
    const values = Object.values(filters);

    for (let i = 0; i < keys.length; i++) {
      const searchField = keys[i].toLocaleLowerCase();
      if (fieldNames.includes(searchField)) {
        const fieldName = keys[i];
        OR_CONDITIONS.push({
          extras: {
            path: [fieldName],
            string_contains: values[i],
          },
        });
      }
    }

    if (filters.location !== undefined) {
      OR_CONDITIONS.push({
        location: { contains: filters.location, mode: 'insensitive' },
      });
    }

    if (filters.name) {
      const { firstName, lastName } = splitBenefName(filters.name);
      const search_conditions = [
        {
          firstName: {
            contains: firstName,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: lastName,
            mode: 'insensitive',
          },
        },
      ];

      if (firstName === lastName) {
        OR_CONDITIONS.push({
          OR: search_conditions,
        });
      } else {
        OR_CONDITIONS.push({
          AND: search_conditions,
        });
      }
    }

    if (filters.govtIDNumber) {
      OR_CONDITIONS.push({
        govtIDNumber: {
          contains: filters.govtIDNumber,
          mode: 'insensitive',
        },
      });
    }

    if (filters.phone) {
      OR_CONDITIONS.push({
        phone: { contains: filters.phone, mode: 'insensitive' },
      });
    }

    if (OR_CONDITIONS.length) {
      conditions = { OR: OR_CONDITIONS };
    }

    return conditions;
  }

  async findAll(filters: ListBeneficiaryDto) {
    const conditions = await this.filterConditions(filters);

    const rData = await paginate(
      this.prisma.beneficiary,
      { where: { ...conditions, archived: false } },
      {
        page: +filters?.page,
        perPage: +filters?.perPage,
      },
    );

    return rData;
  }

  // async findAll(filters: ListBeneficiaryDto) {
  //   const OR_CONDITIONS = [];
  //   let conditions = {};

  //   const fields = await this.fieldDefService.listActive();
  //   const fieldNames = fields.map((f) => f.name);

  //   const keys = Object.keys(filters);
  //   const values = Object.values(filters);
  //   for (let i = 0; i < keys.length; i++) {
  //     const searchField = keys[i].toLocaleLowerCase();
  //     const found = fieldNames.includes(searchField);
  //     if (found) {
  //       const fieldName = keys[i];
  //       OR_CONDITIONS.push({
  //         extras: {
  //           path: [fieldName],
  //           string_contains: values[i],
  //         },
  //       });
  //     }
  //   }

  //   // if (OR_CONDITIONS.length) conditions = { OR: OR_CONDITIONS };

  //   if (filters.location) {
  //     OR_CONDITIONS.push({
  //       location: { contains: filters.location, mode: 'insensitive' },
  //     });
  //     conditions = { OR: OR_CONDITIONS };
  //   }

  //   if (filters.name) {
  //     const { firstName, lastName } = splitBenefName(filters.name);
  //     const search_conditions = [
  //       {
  //         firstName: {
  //           contains: firstName,
  //           mode: 'insensitive',
  //         },
  //       },
  //       {
  //         lastName: {
  //           contains: lastName,
  //           mode: 'insensitive',
  //         },
  //       },
  //     ];

  //     if (firstName === lastName) {
  //       OR_CONDITIONS.push({
  //         OR: search_conditions,
  //       });
  //       conditions = { OR: OR_CONDITIONS };
  //     }

  //     OR_CONDITIONS.push({
  //       AND: search_conditions,
  //     });
  //     conditions = { OR: OR_CONDITIONS };
  //   }

  //   if (filters.govtIDNumber) {
  //     OR_CONDITIONS.push({
  //       govtIDNumber: { contains: filters.govtIDNumber, mode: 'insensitive' },
  //     });
  //     conditions = { OR: OR_CONDITIONS };
  //   }

  //   if (filters.phone) {
  //     OR_CONDITIONS.push({
  //       phone: { contains: filters.phone, mode: 'insensitive' },
  //     });
  //     conditions = { OR: OR_CONDITIONS };
  //   }

  //   const rData = await paginate(
  //     this.prisma.beneficiary,
  //     { where: { ...conditions, archived: false } },
  //     {
  //       page: +filters?.page,
  //       perPage: +filters?.perPage,
  //     },
  //   );
  //   return rData;
  // }

  findOne(uuid: string) {
    return this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });
  }

  async update(uuid: string, dto: UpdateBeneficiaryDto) {
    const { hasPhone, hasGovtID } = (await this.checkDuplicatePhoneAndGovtID(
      dto.phone,
      dto.govtIDNumber,
    )) as any;
    if (hasPhone) delete dto.phone;
    if (hasGovtID) delete dto.govtIDNumber;
    const findUuid = await this.findOne(uuid);

    if (!findUuid) throw new Error('Not Found');
    const { birthDate, extras } = dto;
    if (birthDate) {
      const formattedDate = new Date(dto.birthDate).toISOString();
      dto.birthDate = formattedDate;
    }
    if (Object.keys(extras).length) {
      const fields = await this.fieldDefService.listActive();
      if (!fields.length) throw new Error('Please setup allowed fields first!');
      const nonMatching = validateAllowedFieldAndTypes(extras, fields);
      if (nonMatching.length)
        throw new Error(
          `[${nonMatching.toString()}] field/type are not allowed inside extras!`,
        );
    }

    const beneficiaryData = await this.prisma.beneficiary.update({
      where: {
        uuid,
      },
      data: dto,
    });
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_UPDATED);

    return beneficiaryData;
  }

  async createLog(logData) {
    return await this.prisma.log.create({ data: logData });
  }

  async findUnique(uuid: string) {
    return this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
      include: {
        beneficiariesGroup: {
          select: {
            beneficiaryUID: true,
            groupUID: true,
          },
        },
      },
    });
  }

  async archiveBeneficiary(uuid: string) {
    return this.prisma.beneficiary.update({
      where: {
        uuid,
      },
      data: {
        archived: true,
      },
    });
  }
  async remove(uuid: string, userUUID: string) {
    const benef = await this.findUnique(uuid);

    if (!benef) throw new Error('Beneficiary not found!');
    // 1. Archive the beneficiary
    const rData = await this.archiveBeneficiary(uuid);

    const logData: any = {
      createdBy: userUUID,
      action: BeneficiaryEvents.BENEFICIARY_ARCHIVED,
      data: rData,
    };

    if (benef?.beneficiariesGroup?.length > 0) {
      for (const item of benef.beneficiariesGroup) {
        // 2. Remove beneficiary from all the groups
        await this.beneficiaryGroupService.removeBeneficiaryFromGroup(
          item.beneficiaryUID,
          item.groupUID,
        );
        // 3. Remove all the sources
        await this.prisma.beneficiarySource.deleteMany({
          where: { beneficiaryUID: item.beneficiaryUID },
        });
      }
    }

    // 3. Create log
    await this.createLog(logData);

    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_REMOVED);
    return 'Removed Succesfullty';
  }

  async deletePermanently(uuid: string) {
    const rData = await this.prisma.beneficiary.delete({
      where: {
        uuid,
      },
    });
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_REMOVED);
    return rData;
  }

  addBulk(dto: BulkInsertDto) {
    const rdata = this.prisma.beneficiary.createMany({ data: dto.data });
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);
    return rdata;
  }

  async uploadFile(file: any) {
    const workbook = XLSX.readFile(file.path);
    await deleteFileFromDisk(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetId = workbook.SheetNames[0].toLowerCase().replace(/\s/g, '_');
    const data = {
      workbookData: XLSX.utils.sheet_to_json(sheet),
      sheetId,
    };

    return data;
  }

  async findAllLocation() {
    return await this.prisma.beneficiary.findMany({
      where: {
        location: {
          not: null,
        },
      },

      select: {
        location: true,
      },
      distinct: ['location'],
    });
  }
}
