import { Injectable } from '@nestjs/common';

import {
  BulkInsertDto,
  CreateBeneficiaryDto,
  ListBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { ArchiveType } from 'libs/sdk/src/enums';
import XLSX from 'xlsx';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { validateAllowedFieldAndTypes } from '../field-definitions/helpers';
import { deleteFileFromDisk } from '../utils/multer';
import { paginate } from '../utils/paginate';
import { createSearchQuery } from './helpers';

import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BeneficiaryEvents,
  generateRandomWallet,
} from '@rahataid/community-tool-sdk';
import { DB_MODELS } from '../../constants';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import { convertDateToISO } from '../utils';

@Injectable()
export class BeneficiariesService {
  constructor(
    private prisma: PrismaService,
    private fieldDefService: FieldDefinitionsService,
    private eventEmitter: EventEmitter2,
    private beneficiaryGroupService: BeneficiaryGroupService,
  ) {}

  async fetchDBFields() {
    const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    if (!dbFields.length) return [];
    const scalarFields = dbFields.filter((f) => f.kind === 'scalar');
    const extraFields = dbFields.filter((f) => f.type.toLowerCase() === 'json');
    return { scalarFields, extraFields };
  }

  async addToGroups({ benefUID, defaultGroupUID, importGroupUID }) {
    await this.upsertToDefaultGroup({ defaultGroupUID, benefUID });
    await this.upsertToImportGroup({ importGroupUID, benefUID });
  }

  upsertToDefaultGroup({ defaultGroupUID, benefUID }) {
    return this.prisma.beneficiaryGroup.upsert({
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

  upsertToImportGroup({ importGroupUID, benefUID }) {
    return this.prisma.beneficiaryGroup.upsert({
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

  // if (beneficiaryData.extras.hasOwnProperty('uuid')) {
  //   beneficiaryData.uuid = beneficiaryData.extras.uuid;
  //   delete beneficiaryData.extras.uuid;
  // }

  async upsertByGovtID({ defaultGroupUID, importGroupUID, beneficiary }) {
    // if (beneficiary.birthDate) {
    //   beneficiary.birthDate = convertDateToISO(beneficiary.birthDate);
    // }
    // const exist = await this.findOneByGovtID(beneficiary.govtIDNumber);
    // if (exist) await this.addBeneficiaryToArchive(exist, ArchiveType.UPDATED);
    // const res = await this.prisma.beneficiary.upsert({
    //   where: { govtIDNumber: beneficiary.govtIDNumber },
    //   update: beneficiary,
    //   create: beneficiary,
    // });
    // if (!exist)
    //   await this.addToGroups({
    //     benefUID: res.uuid,
    //     defaultGroupUID,
    //     importGroupUID,
    //   });
    // return res;
  }

  async upsertByUUID({ defaultGroupUID, importGroupUID, beneficiary }) {
    if (beneficiary.birthDate) {
      beneficiary.birthDate = convertDateToISO(beneficiary.birthDate);
    }
    const exist = await this.findOne(beneficiary.uuid);
    if (exist) await this.addBeneficiaryToArchive(exist, ArchiveType.UPDATED);
    if (!beneficiary.walletAddress) {
      beneficiary.walletAddress = generateRandomWallet().address;
    }
    const res = await this.prisma.beneficiary.upsert({
      where: { uuid: beneficiary.uuid },
      update: beneficiary,
      create: beneficiary,
    });
    await this.addToGroups({
      benefUID: res.uuid,
      defaultGroupUID,
      importGroupUID,
    });
    return res;
  }

  async addBeneficiaryToArchive(beneficiary: any, flag: ArchiveType) {
    beneficiary.archiveType = flag;
    return this.prisma.beneficiaryArchive.upsert({
      where: { uuid: beneficiary.uuid },
      update: beneficiary,
      create: beneficiary,
    });
  }

  async create(dto: CreateBeneficiaryDto) {
    const { birthDate, extras, walletAddress } = dto;
    if (birthDate) dto.birthDate = convertDateToISO(birthDate);

    if (!walletAddress) {
      dto.walletAddress = generateRandomWallet().address;
    }

    if (Object.keys(extras).length > 0) {
      const fields = await this.fieldDefService.listActive();
      if (!fields.length) throw new Error('Please setup allowed fields first!');
      const nonMatching = validateAllowedFieldAndTypes(extras, fields);
      if (nonMatching.length)
        throw new Error(
          `[${nonMatching.toString()}] field/type are not allowed inside extras!`,
        );
    }

    const createdData = await this.prisma.beneficiary.create({
      data: {
        ...dto,
      },
    });
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);
    return createdData;
  }

  async searchTargets(filters: any) {
    const search_conditions = createSearchQuery(filters);
    return paginate(
      this.prisma.beneficiary,
      { where: search_conditions },
      {
        page: +filters?.page,
        perPage: +filters?.perPage || 500,
      },
    );
  }

  async findAll(filters: ListBeneficiaryDto) {
    const OR_CONDITIONS = [];
    let conditions = {};

    const fields = await this.fieldDefService.listActive();
    const fieldNames = fields.map((f) => f.name);

    const keys = Object.keys(filters);
    const values = Object.values(filters);
    for (let i = 0; i < keys.length; i++) {
      const searchField = keys[i].toLocaleLowerCase();
      const found = fieldNames.includes(searchField);
      if (found) {
        const fieldName = keys[i];
        OR_CONDITIONS.push({
          extras: {
            path: [fieldName],
            string_contains: values[i],
          },
        });
      }
    }

    if (OR_CONDITIONS.length) conditions = { OR: OR_CONDITIONS };

    if (filters.location) {
      OR_CONDITIONS.push({
        location: { contains: filters.location, mode: 'insensitive' },
      });
      conditions = { OR: OR_CONDITIONS };
    }

    if (filters.firstName) {
      OR_CONDITIONS.push({
        firstName: { contains: filters.firstName, mode: 'insensitive' },
      });
      conditions = { OR: OR_CONDITIONS };
    }

    return paginate(
      this.prisma.beneficiary,
      { where: { ...conditions, archived: false } },
      {
        page: +filters?.page,
        perPage: +filters?.perPage,
      },
    );
  }

  findOne(uuid: string) {
    return this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });
  }

  findOneByGovtID(govtID: string) {
    // return this.prisma.beneficiary.findUnique({
    //   where: { govtIDNumber: govtID },
    // });
  }

  async update(uuid: string, dto: UpdateBeneficiaryDto) {
    const findUuid = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });

    if (!findUuid) throw new Error('Not Found');
    const { birthDate, extras } = dto;
    if (birthDate) {
      const formattedDate = new Date(dto.birthDate).toISOString();
      dto.birthDate = formattedDate;
    }
    if (extras) {
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

  async remove(uuid: string, userUUID: string) {
    const benef = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiariesGroup: {
          select: {
            beneficiaryUID: true,
            groupUID: true,
          },
        },
      },
    });

    if (!benef) throw new Error('Beneficiary not found!');
    // 1. Archive the beneficiary
    const rData = await this.update(uuid, { archived: true });
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
    return rData;
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
}
