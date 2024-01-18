import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { uuid } from 'uuidv4';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { PrismaService } from '@rahat/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { validateAllowedFieldAndTypes } from '../field-definitions/helpers';
import { paginate } from '../utils/paginate';
import XLSX from 'xlsx';
import {
  extractFieldsMatchingWithDBFields,
  fetchSchemaFields,
  injectCustomID,
  parseValuesByTargetTypes,
  validateRequiredFields,
} from './helpers';
import { DB_MODELS } from '../../constants';
import { deleteFileFromDisk } from '../utils/multer';
import { SourceService } from '../source/source.service';

@Injectable()
export class BeneficiariesService {
  constructor(
    private prisma: PrismaService,
    private fieldDefService: FieldDefinitionsService,
    private sourceService: SourceService,
  ) {}

  async importBySourceUUID(uuid: string) {
    const source = await this.sourceService.findOne(uuid);
    if (!source) {
      throw new HttpException('Source not found!', HttpStatus.NOT_FOUND);
    }
    const jsonData = source.field_mapping as {
      data: object;
    };
    // 1. Fetch DB_Fields and validate required fields
    const mapped_fields = jsonData.data;
    const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const missing_fields = validateRequiredFields(mapped_fields);

    if (missing_fields.length) {
      throw new HttpException(
        `Required fields missing! [${missing_fields.toString()}]`,
        HttpStatus.BAD_REQUEST,
      );
    }
    // 2. Only select fields matching with DB_Fields
    const sanitized_fields = extractFieldsMatchingWithDBFields(
      dbFields,
      mapped_fields,
    );
    // 3. Parse values against target field
    const parsed_data = parseValuesByTargetTypes(sanitized_fields, dbFields);
    // 4. Inject unique key based on settings
    const final_payload = injectCustomID(parsed_data);
    let count = 0;
    // 5. Save Benef and source
    for (let p of final_payload) {
      count++;
      const benef = await this.prisma.beneficiary.upsert({
        where: { custom_id: p.custom_id },
        update: { custom_id: p.custom_id },
        create: p,
      });
      if (benef) {
        await this.sourceService.createBeneficiarySource({
          beneficiary_id: benef.id,
          source_id: source.id,
        });
      }
    }
    return {
      success: true,
      status: 200,
      message: `${count} out of ${final_payload.length} Beneficiaries imported!`,
    };
  }

  async create(dto: CreateBeneficiaryDto) {
    try {
      const { birthDate, extras } = dto;
      if (birthDate) {
        const formattedDate = new Date(dto.birthDate).toISOString();
        dto.birthDate = formattedDate;
      }
      if (extras) {
        const fields = await this.fieldDefService.listActive();
        if (!fields.length)
          throw new Error('Please setup allowed fields first!');
        const nonMatching = validateAllowedFieldAndTypes(extras, fields);
        if (nonMatching.length)
          throw new Error(
            `[${nonMatching.toString()}] field/type are not allowed inside extras!`,
          );
      }

      console.log(dto);
      return this.prisma.beneficiary.create({
        data: {
          custom_id: uuid(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          birth_date: dto.birthDate,
          email: dto.email,
          extras: dto.extras,
          location: dto.location,
          latitude: dto.latitude,
          longitude: dto.longitude,
          phone: dto.phone,
          notes: dto.notes,
        },
      });
    } catch (error) {
      console.log('beneficiaryService', error);
    }
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
    const findUuid = await this.prisma.beneficiary.findUnique({
      where: {
        uuid,
      },
    });

    if (!findUuid) throw new HttpException('Data not Found', 404);
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

    if (!findUuid) throw new HttpException('Data not Found', 404);
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

    if (!findUuid) throw new HttpException('Data not Found', 404);
    return await this.prisma.beneficiary.delete({
      where: {
        uuid,
      },
    });
  }

  async uploadFile(file: any) {
    const workbook = XLSX.readFile(file.path);
    await deleteFileFromDisk(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    data.forEach((element: CreateBeneficiaryDto) => {
      this.create(element);
    });
    return 'Data Uploded Sucessfully';
  }
}
