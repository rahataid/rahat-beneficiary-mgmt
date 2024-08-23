import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@rahataid/community-tool-extensions';
import { convertToValidString } from '../utils';
import { ExcelParser } from '../utils/excel.parser';
import { contains, equals } from 'class-validator';
import { FIELD_DEF_TYPES } from '@rahataid/community-tool-sdk';
import {
  convertStringsToDropdownOptions,
  removeConsecutiveSpaces,
} from './helpers';

@Injectable()
export class FieldDefinitionsService {
  constructor(private prisma: PrismaService) {}

  bulkUpload(file: Express.Multer.File, req: any) {
    const data = ExcelParser(file.buffer) as CreateFieldDefinitionDto[];
    if (!data.length) throw new Error('No data found in the file!');
    return this.createBulk(data, req);
  }
  async createBulk(data: CreateFieldDefinitionDto[], req: any) {
    let uploadedCount = 0;
    for (let d of data) {
      await this.upsertByName(d, req);
      uploadedCount++;
    }
    return { message: `${uploadedCount} fields uploaded successfully!` };
  }

  upsertByName(data: CreateFieldDefinitionDto, req: any) {
    data.createdBy = req?.user?.uuid || '';
    const { name, fieldType, dropdownPopulates, ...rest } = data;
    const parsedName = convertToValidString(name);
    const payload = {
      name: parsedName,
      variations: [removeConsecutiveSpaces(name)],
      fieldType,
      ...rest,
    };
    if (fieldType === FIELD_DEF_TYPES.DROPDOWN && dropdownPopulates) {
      const pupulateData = convertStringsToDropdownOptions(dropdownPopulates);
      if (pupulateData) payload.fieldPopulate = pupulateData;
    }
    return this.prisma.fieldDefinition.upsert({
      where: { name: parsedName },
      update: payload,
      create: payload,
    });
  }

  create(dto: CreateFieldDefinitionDto) {
    const payload = {
      ...dto,
      name: convertToValidString(dto.name),
      fieldPopulate:
        dto?.fieldPopulate?.data?.length > 0
          ? {
              data: dto.fieldPopulate.data.map((item) => ({
                label: item.label,
                value: item.value,
              })),
            }
          : [],
    };

    return this.prisma.fieldDefinition.create({
      data: payload,
    });
  }

  listActive() {
    return this.prisma.fieldDefinition.findMany({
      where: { isActive: true },
      orderBy: {
        name: 'asc',
      },
    });
  }

  listActiveSecondary() {
    return this.prisma.fieldDefinition.findMany({
      where: { isActive: true, isSystem: false },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findAll(query) {
    const select = {
      id: true,
      name: true,
      fieldType: true,
      isActive: true,
      isTargeting: true,
      fieldPopulate: true,
      variations: true,
    };

    const isTargeting =
      query.isTargeting === 'true'
        ? true
        : query.isTargeting === 'false'
        ? false
        : undefined;

    let where: any = {};

    if (query.name) {
      const searchText = query.name.trim().replace(/\s+/g, '_');
      where = {
        name: {
          contains: searchText,
          mode: 'insensitive',
        },
      };
    }

    return paginate(
      this.prisma.fieldDefinition,
      { select, where: { isTargeting: isTargeting, ...where } },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
  }

  async findOne(id: number) {
    const data = await this.prisma.fieldDefinition.findUnique({
      where: { id },
    });
    if (!data) return { status: 404, message: 'Data not found!' };
    return data;
  }

  update(id: number, dto: UpdateFieldDefinitionDto) {
    const { fieldPopulate } = dto;
    const populateData =
      fieldPopulate && fieldPopulate.data ? { data: fieldPopulate.data } : null;
    const payload = {
      ...dto,
      fieldPopulate: populateData,
    };
    if (dto.name && payload.name !== 'govtIDNumber') {
      payload.name = convertToValidString(dto.name);
    }
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: payload,
    });
  }

  updateStatus(id: number, dto: updateFieldStatusDto) {
    return this.prisma.fieldDefinition.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} fieldDefinition`;
  }
}
