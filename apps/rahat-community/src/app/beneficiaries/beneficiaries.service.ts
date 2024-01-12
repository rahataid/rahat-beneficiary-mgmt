import { Injectable } from '@nestjs/common';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { PrismaService } from '@rahat/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { validateAllowedFieldAndTypes } from '../field-definitions/helpers';
import { paginate } from '../utils/paginate';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';
import { fetchSchemaFields, validateFieldAndTypes } from './helpers';
import { DB_MODELS } from '../../constants';

@Injectable()
export class BeneficiariesService {
  constructor(
    private prisma: PrismaService,
    private fieldDefService: FieldDefinitionsService,
  ) {}

  async validateAndImport(dto: any) {
    try {
      // Limit number of imports?
      // Validate required fields
      // Validate data types
      // Duplicate/Upsert check?
      const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
      const hasInvalid = validateFieldAndTypes(dbFields, dto);
      if (hasInvalid.length)
        throw new Error(`Please check these fields: ${hasInvalid.toString()}`);
      const importIdMapped = dto.map((d: any) => {
        const newItem = { ...d, gender: 'Male', importId: d._id.toString() };
        delete newItem._id;
        return newItem;
      });
      return this.prisma.beneficiary.createMany({
        data: importIdMapped,
        skipDuplicates: false,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async create(dto: CreateBeneficiaryDto) {
    console.log(dto);
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
    return this.prisma.beneficiary.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        birthDate: dto.birthDate,
        email: dto.email,
        extras: dto.extras,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        phone: dto.phone,
        notes: dto.notes,
      },
    });
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
      console.log({ searchField });
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

    console.log('Final_Condition==>', conditions);

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
    return await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });
  }

  async update(uuid: string, dto: UpdateBeneficiaryDto) {
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
    return await this.prisma.beneficiary.delete({
      where: {
        uuid,
      },
    });
  }

  async uploadFile(file: any) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    console.log(fileExtension);
    switch (fileExtension) {
      case '.csv':
        return this.readCsv(file);
      case '.xls':
        return this.readXlsx(file);
      default:
        throw new Error('Unsupported file type');
    }
  }
  private async readXlsx(file: any) {
    console.log(file);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.buffer);

    const worksheet = workbook.worksheets[0];
    const rows: any[][] = [];

    worksheet.eachRow((row, rowNumber) => {
      const rowData: any[] = [];
      row.eachCell((cell) => {
        rowData.push(cell.value);
      });
      rows.push(rowData);
    });

    return rows;
  }

  private async readCsv(file: any) {
    const rows: any[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.buffer)
        .pipe(csvParser())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
