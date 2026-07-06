import { Injectable, Logger } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import {
  CreateFieldDefinitionDto,
  UpdateFieldDefinitionDto,
  updateFieldStatusDto,
} from '@rahataid/community-tool-extensions';
import { convertToValidString } from '../utils';
import { ExcelParser } from '../utils/excel.parser';
import { FIELD_DEF_TYPES } from '@rahataid/community-tool-sdk';
import {
  convertStringsToFieldOptions,
  removeConsecutiveSpaces,
} from './helpers';

@Injectable()
export class FieldDefinitionsService {
  private readonly logger = new Logger(FieldDefinitionsService.name);

  constructor(private prisma: PrismaService) {}

  private static readonly TYPES_WITH_OPTIONS = [
    FIELD_DEF_TYPES.DROPDOWN,
    FIELD_DEF_TYPES.RADIO,
    FIELD_DEF_TYPES.CHECKBOX,
  ];

  bulkUpload(file: Express.Multer.File, req: any) {
    try {
      this.logger.log(`Bulk upload started. fileName=${file.originalname}`);
      const raw = ExcelParser(file.buffer) as CreateFieldDefinitionDto[];
      if (!raw.length) throw new Error('No data found in the file!');
      this.logger.debug(`Parsed ${raw.length} rows from Excel`);

      const data = raw.filter((d) => d.name?.trim() && d.fieldType);
      const skipped = raw.length - data.length;
      if (skipped > 0) {
        this.logger.debug(`Skipped ${skipped} rows missing name or fieldType`);
      }
      if (!data.length) throw new Error('No valid field definitions found in the file!');

      return this.createBulk(data, req);
    } catch (error) {
      this.logger.error(`Bulk upload failed. fileName=${file.originalname}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async createBulk(data: CreateFieldDefinitionDto[], req: any) {
    try {
      this.logger.debug(`Creating bulk upsert transaction for ${data.length} fields`);
      const operations = data.map((d) => {
        const { parsedName, payload } = this.buildUpsertPayload(d, req);
        return this.prisma.fieldDefinition.upsert({
          where: { name: parsedName },
          update: payload,
          create: payload,
        });
      });
      const results = await this.prisma.$transaction(operations);
      this.logger.log(`Bulk upload completed. ${results.length} fields upserted`);
      return { message: `${results.length} fields uploaded successfully!` };
    } catch (error) {
      this.logger.error(`Bulk create failed for ${data.length} fields`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async upsertByName(data: CreateFieldDefinitionDto, req: any) {
    const { parsedName, payload } = this.buildUpsertPayload(data, req);
    try {
      this.logger.debug(`Upserting field definition: ${parsedName}`);
      return await this.prisma.fieldDefinition.upsert({
        where: { name: parsedName },
        update: payload,
        create: payload,
      });
    } catch (error) {
      this.logger.error(`Upsert failed for field: ${parsedName}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildUpsertPayload(data: CreateFieldDefinitionDto, req: any) {
    data.createdBy = req?.user?.uuid || '';
    const { name, fieldType, dropdownPopulates, ...rest } = data;
    const parsedName = convertToValidString(name);

    let fieldPopulate = rest.fieldPopulate;
    if (FieldDefinitionsService.TYPES_WITH_OPTIONS.includes(fieldType) && dropdownPopulates) {
      const populateData = convertStringsToFieldOptions(dropdownPopulates);
      if (populateData) fieldPopulate = populateData;
    }

    const payload = {
      name: parsedName,
      variations: [removeConsecutiveSpaces(name)],
      fieldType,
      ...rest,
      fieldPopulate,
    };
    return { parsedName, payload };
  }

  async create(dto: CreateFieldDefinitionDto) {
    this.logger.log(`Creating field definition: ${dto.name} (${dto.fieldType})`);
    try {
      const payload = {
        ...dto,
        name: convertToValidString(dto.name),
        fieldPopulate:
          dto?.fieldPopulate?.data?.length > 0
            ? {
                data: dto.fieldPopulate.data.map((item: { label: string; value: string }) => ({
                  label: item.label,
                  value: item.value,
                })),
              }
            : [],
      };

      return await this.prisma.fieldDefinition.create({
        data: payload,
      });
    } catch (error) {
      this.logger.error(`Create failed for field: ${dto.name}`, error instanceof Error ? error.stack : error);
      throw error;
    }
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
    try {
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

      let where: Prisma.FieldDefinitionWhereInput = {};

      if (query.name) {
        const searchText = query.name.trim().replace(/\s+/g, '_');
        where = {
          name: {
            contains: searchText,
            mode: 'insensitive',
          },
        };
      }

      return await paginate(
        this.prisma.fieldDefinition,
        { select, where: { isTargeting: isTargeting, ...where } },
        {
          page: query?.page,
          perPage: query?.perPage,
        },
      );
    } catch (error) {
      this.logger.error('Failed to fetch field definitions', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.prisma.fieldDefinition.findUnique({
        where: { id },
      });
      if (!data) return { status: 404, message: 'Data not found!' };
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch field definition id=${id}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async update(id: number, dto: UpdateFieldDefinitionDto) {
    this.logger.log(`Updating field definition id=${id}`);
    this.logger.debug(`Update payload: ${JSON.stringify(dto)}`);
    try {
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
      return await this.prisma.fieldDefinition.update({
        where: { id },
        data: payload,
      });
    } catch (error) {
      this.logger.error(`Update failed for field definition id=${id}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async updateStatus(id: number, dto: updateFieldStatusDto) {
    this.logger.log(`Updating field status id=${id} isActive=${dto.isActive}`);
    try {
      return await this.prisma.fieldDefinition.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.logger.error(`Status update failed for field definition id=${id}`, error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}
