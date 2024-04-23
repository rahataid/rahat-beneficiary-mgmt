import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import {
  CreateSourceDto,
  UpdateSourceDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { Queue } from 'bull';
import { uuid, isUuid } from 'uuidv4';
import {
  EXTERNAL_UUID_FIELD,
  IMPORT_ACTION,
  JOBS,
  QUEUE,
  QUEUE_RETRY_OPTIONS,
} from '../../constants';
import { validateSchemaFields } from '../beneficiary-import/helpers';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { parseIsoDateToString } from '../utils';
import { paginate } from '../utils/paginate';
import { ImportField } from 'libs/sdk/src/enums';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY.IMPORT) private queueClient: Queue,
    private prisma: PrismaService,
    private readonly fdService: FieldDefinitionsService,
  ) {}

  formatEnumFieldValues(item: any) {
    if (item.gender) item.gender = item.gender.toUpperCase();
    if (item.phoneStatus) item.phoneStatus = item.phoneStatus.toUpperCase();
    if (item.bankedStatus) item.bankedStatus = item.bankedStatus.toUpperCase();
    if (item.internetStatus)
      item.internetStatus = item.internetStatus.toUpperCase();
    return item;
  }

  async create(dto: CreateSourceDto) {
    const { action, ...rest } = dto;
    const { data } = dto.fieldMapping;
    if (!data.length) throw new Error('No data found!');

    let payloadWithUUID = data.map((d: any) => {
      if (d.govtIDNumber) d.govtIDNumber = d.govtIDNumber.toString();
      const formatted = this.formatEnumFieldValues(d);
      return {
        ...formatted,
        uuid: uuid(),
      };
    });
    console.log('Payload Before==>', payloadWithUUID);
    const extraFields = await this.listExtraFields();
    const hasUUID = data[0].rawData.hasOwnProperty(EXTERNAL_UUID_FIELD);
    if (hasUUID) {
      payloadWithUUID = data.map((d: any) => {
        return { ...d, uuid: d[EXTERNAL_UUID_FIELD] };
      });
    }

    if (action === IMPORT_ACTION.VALIDATE)
      return this.ValidateBeneficiaryImort({
        data: payloadWithUUID,
        extraFields,
        hasUUID,
      });

    if (action === IMPORT_ACTION.IMPORT) {
      const { allValidationErrors } = await validateSchemaFields(
        payloadWithUUID,
        extraFields,
        hasUUID,
      );

      if (allValidationErrors.length)
        throw new Error('Invalid data submitted!');
      rest.fieldMapping.data = payloadWithUUID;
      rest.importField = hasUUID
        ? ImportField.UUID
        : ImportField.GOVT_ID_NUMBER;
      return this.createSourceAndAddToQueue(rest);
    }
  }

  async getMappingsByImportId(importId: string) {
    const res: any = await this.prisma.source.findUnique({
      where: { importId },
    });
    if (!res) return null;
    return res;
  }

  async listExtraFields() {
    const fd = await this.fdService.listActive();
    if (!fd.length) return [];

    return fd.map((item: any) => {
      return {
        name: item.name,
        type: item.fieldType,
        fieldPopulate: item.fieldPopulate,
      };
    });
  }

  async getDuplicateCountByGovtIDNumber(payload: []) {
    let count = 0;
    for (let p of payload) {
      const keyExist = Object.hasOwnProperty.call(p, 'govtIDNumber');
      if (keyExist) {
        const res = await this.prisma.beneficiary.findUnique({
          where: { govtIDNumber: p['govtIDNumber'] },
        });
        if (res) count++;
      }
    }
    return count;
  }

  async ValidateBeneficiaryImort({ data, extraFields, hasUUID }) {
    let result = [] as any;
    const { allValidationErrors, processedData } = await validateSchemaFields(
      data,
      extraFields,
      hasUUID,
    );

    result = await this.checkDuplicateByGovtIDNumber(processedData);

    if (hasUUID) {
      result = await this.checkDuplicateByExternalUUID(
        processedData,
        EXTERNAL_UUID_FIELD,
      );
    }

    const duplicates = result.filter((f) => f.isDuplicate);
    const dateParsedDuplicates = duplicates.map((d) => {
      let item = { ...d };
      if (item.birthDate) {
        item.birthDate = parseIsoDateToString(item.birthDate);
      }
      return item;
    });
    const finalResult = result.filter((f) => !f.exportOnly);
    return {
      invalidFields: allValidationErrors,
      result: finalResult,
      duplicates: dateParsedDuplicates,
    };
  }

  async createSourceAndAddToQueue(data: CreateSourceDto) {
    const row = await this.prisma.source.upsert({
      where: { importId: data.importId },
      update: { ...data, isImported: false },
      create: data,
    });
    this.queueClient.add(
      JOBS.BENEFICIARY.IMPORT,
      { sourceUUID: row.uuid },
      QUEUE_RETRY_OPTIONS,
    );
    return { message: 'Source created and added to queue' };
  }

  async checkDuplicateByGovtIDNumber(data: any) {
    const result = [];
    for (let p of data) {
      p.isDuplicate = false;
      const keyExist = Object.hasOwnProperty.call(p, 'govtIDNumber');

      if (keyExist && p['govtIDNumber']) {
        const res = await this.prisma.beneficiary.findUnique({
          where: { govtIDNumber: p['govtIDNumber'].toString() },
        });
        if (res) {
          p.isDuplicate = true;
          result.push({ ...res, isDuplicate: true, exportOnly: true });
        }
      }
      result.push(p);
    }
    return result;
  }

  async checkDuplicateByExternalUUID(data: any, external_uuid: string) {
    const result = [];
    for (let p of data) {
      p.isDuplicate = false;
      const keyExist = Object.hasOwnProperty.call(p, external_uuid);
      if (keyExist && p[external_uuid]) {
        const rahat_uuid = p[external_uuid];
        const isValid = isUuid(rahat_uuid);
        if (!isValid) throw new Error('Data contains invalid rahat UUID!');
        const res = await this.prisma.beneficiary.findUnique({
          where: { uuid: rahat_uuid },
        });
        if (res) {
          p.isDuplicate = true;
          result.push({
            ...res,
            uuid: rahat_uuid,
            isDuplicate: true,
            exportOnly: true,
          });
        }
      }
      result.push(p);
    }
    return result;
  }

  findAll(query: any) {
    const select = {
      fieldMapping: true,
      uuid: true,
      id: true,
      name: true,
      createdAt: true,
    };

    return paginate(
      this.prisma.source,
      { select },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
  }

  findOne(uuid: string) {
    return this.prisma.source.findUnique({ where: { uuid } });
  }

  update(uuid: string, dto: UpdateSourceDto) {
    return this.prisma.source.update({
      where: { uuid },
      data: dto,
    });
  }

  updateImportFlag(uuid: string, flag: boolean) {
    return this.prisma.source.update({
      where: { uuid },
      data: { isImported: flag },
    });
  }

  remove(uuid: string) {
    return this.prisma.source.delete({
      where: {
        uuid,
      },
    });
  }
}
