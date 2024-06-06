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
import {
  formatEnumFieldValues,
  validateSchemaFields,
} from '../beneficiary-import/helpers';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { parseIsoDateToString, allowOnlyAlphabetAndNumbers } from '../utils';
import { paginate } from '../utils/paginate';
import { Enums } from '@rahataid/community-tool-sdk';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY) private queueClient: Queue,
    private prisma: PrismaService,
    private readonly fdService: FieldDefinitionsService,
  ) {}

  async fetchExistingBeneficiaries() {
    const res = await this.prisma.beneficiary.findMany({
      select: {
        phone: true,
        govtIDNumber: true,
      },
    });
    return res;
  }

  async checkDuplicateBeneficiary(payload: any) {
    const existing = await this.fetchExistingBeneficiaries();
    return this.compareDuplicateBeneficiary(payload, existing);
  }

  async compareDuplicateBeneficiary(payload: any, existingData: any) {
    let result = [];
    for (let p of payload) {
      if (p.phone) {
        const found = existingData.find(
          (f) =>
            allowOnlyAlphabetAndNumbers(f.phone) ===
            allowOnlyAlphabetAndNumbers(p.phone),
        );
        if (found) p.isDuplicate = true;
      }
      if (p.govtIDNumber) {
        const found = existingData.find(
          (f) =>
            allowOnlyAlphabetAndNumbers(f.govtIDNumber) ===
            allowOnlyAlphabetAndNumbers(p.govtIDNumber),
        );
        if (found) p.isDuplicate = true;
      }
      result.push(p);
    }
    return result;
  }

  // 1. Validate required fields
  // 2. Fetch data from tbl_beneficiary with govtIDNumber and phone number
  // 3. Sanitize phone and govtIDNumber as alphanumeric
  // 4. Merge data with tbl_beneficiary and payload data
  // 5. Compare payload data with merged data
  // 6. Return payload data with isDuplicate flag
  async create(dto: CreateSourceDto) {
    const { action, ...rest } = dto;
    const { data } = dto.fieldMapping;
    if (!data.length) throw new Error('No data found!');

    let payloadWithUUID = data.map((d: any) => {
      if (d.govtIDNumber) d.govtIDNumber = d.govtIDNumber.toString();
      if (d.phone) d.phone = d.phone.toString();
      const formatted = formatEnumFieldValues(d);
      return {
        ...formatted,
        uuid: uuid(),
      };
    });
    const extraFields = await this.listExtraFields();
    const hasUUID = data[0].hasOwnProperty(EXTERNAL_UUID_FIELD);
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
      rest.importField = Enums.ImportField.UUID;
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

  async ValidateBeneficiaryImort({ data, extraFields, hasUUID }) {
    const { allValidationErrors, processedData } = await validateSchemaFields(
      data,
      extraFields,
      hasUUID,
    );

    const duplicates = await this.checkDuplicateBeneficiary(processedData);

    const dateParsedDuplicates = duplicates.map((d) => {
      let item = { ...d };
      if (item.birthDate) {
        item.birthDate = parseIsoDateToString(item.birthDate);
      }
      return item;
    });
    return {
      invalidFields: allValidationErrors,
      result: dateParsedDuplicates,
      hasUUID,
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

  async checkDuplicateByExternalUUID(data: any, external_uuid: string) {
    const result = [];
    for (let p of data) {
      p.isDuplicate = false;
      const keyExist = Object.hasOwnProperty.call(p, external_uuid);
      if (keyExist && p[external_uuid]) {
        const rahat_uuid = p[external_uuid];
        const isValid = isUuid(rahat_uuid);
        if (!isValid) throw new Error('Data contains invalid UUID!');
        const res = await this.prisma.beneficiary.findUnique({
          where: { uuid: rahat_uuid },
        });
        if (res) p.isDuplicate = true;
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
