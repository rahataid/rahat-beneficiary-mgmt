import { Injectable } from '@nestjs/common';
import { uuid } from 'uuidv4';

import { PrismaService } from '@rumsan/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { validateAllowedFieldAndTypes } from '../field-definitions/helpers';
import { paginate } from '../utils/paginate';
import XLSX from 'xlsx';
import { deleteFileFromDisk } from '../utils/multer';
import { createSearchQuery } from './helpers';
import { GenderEnum } from '../../constants';
import {
  BulkInsertDto,
  CreateBeneficiaryDto,
  UpdateBeneficiaryDto,
} from '@community-tool/extentions';

@Injectable()
export class BeneficiariesService {
  constructor(
    private prisma: PrismaService,
    private fieldDefService: FieldDefinitionsService,
  ) {}

  async upsertByCustomID(payload: any) {
    return this.prisma.beneficiary.upsert({
      where: { customId: payload.customId },
      update: payload,
      create: payload,
    });
  }

  async create(dto: CreateBeneficiaryDto) {
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

    return await this.prisma.beneficiary.create({
      data: {
        customId: uuid(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender.toUpperCase() as GenderEnum,
        birthDate: dto.birthDate,
        email: dto.email,
        extras: dto.extras,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        notes: dto.notes,
        walletAddress: dto.walletAddress,
      },
    });
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

  async findAll(filters: any) {
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

    if (filters.firstName) {
      OR_CONDITIONS.push({
        firstName: { contains: filters.firstName, mode: 'insensitive' },
      });
      conditions = { OR: OR_CONDITIONS };
    }

    if (filters.lastName) {
      OR_CONDITIONS.push({
        lastName: { contains: filters.lastName, mode: 'insensitive' },
      });
      conditions = { OR: OR_CONDITIONS };
    }

    return paginate(
      this.prisma.beneficiary,
      { where: conditions },
      {
        page: +filters?.page,
        perPage: +filters?.perPage,
      },
    );
  }

  async findOne(uuid: string) {
    const findUuid = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });

    if (!findUuid) throw new Error('Data not Found');
    return await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });
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

    return await this.prisma.beneficiary.update({
      where: {
        uuid,
      },
      data: dto,
    });
  }

  async remove(uuid: string) {
    const findUuid = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });

    if (!findUuid) throw new Error('Not Found');
    return await this.prisma.beneficiary.delete({
      where: {
        uuid,
      },
    });
  }

  addBulk(dto: BulkInsertDto) {
    const withCustomID = dto.data.map((d: any) => {
      return { ...d, customId: uuid() };
    });
    return this.prisma.beneficiary.createMany({ data: withCustomID });
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
    console.log(data);
    return data;
  }
}
