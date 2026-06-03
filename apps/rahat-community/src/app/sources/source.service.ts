import { Injectable, Logger } from '@nestjs/common';

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
  BENEF_UNIQUE_FIELDS,
  formatEnumFieldValues,
  resolveUniqueFields,
  validateSchemaFields,
} from '../beneficiary-import/helpers';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';
import { parseIsoDateToString, allowOnlyAlphabetAndNumbers } from '../utils';
import { paginate } from '../utils/paginate';
import { Enums, SETTINGS_NAMES } from '@rahataid/community-tool-sdk';
import { uploadToR2 } from '../export/helpers/r2-upload.helper';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import { DB_MODELS } from '../../constants';

export type ImportProgressStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'FAILED';

export interface ImportProgress {
  total: number;
  imported: number;
  failed: number;
  status: ImportProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

// Primary DB fields that belong in tbl_beneficiaries columns (not extras)
const PRIMARY_BENEFICIARY_FIELDS = new Set<string>([
  'uuid',
  'firstName',
  'lastName',
  'phone',
  'email',
  'govtIDNumber',
  'gender',
  'birthDate',
  'walletAddress',
  'location',
  'latitude',
  'longitude',
  'notes',
  'bankedStatus',
  'internetStatus',
  'phoneStatus',
  'createdBy',
  'createdAt',
  'updatedAt',
  'id',
  'archived',
  'isVerified',
  'extras',
]);

@Injectable()
export class SourceService {
  private readonly logger = new Logger(SourceService.name);

  constructor(
    @InjectQueue(QUEUE.BENEFICIARY) private queueClient: Queue,
    private prisma: PrismaService,
    private readonly fdService: FieldDefinitionsService,
  ) {}

  async fetchExistingBeneficiaries() {
    return this.prisma.beneficiary.findMany({
      select: {
        phone: true,
        govtIDNumber: true,
        walletAddress: true,
        email: true,
      },
    });
  }

  async checkDuplicateBeneficiary(payload: any, uniqueFields: string[]) {
    const existing = await this.fetchExistingBeneficiaries();

    const payloadDups = this.markDuplicates(payload, uniqueFields);
    return this.compareDuplicateBeneficiary(
      payloadDups,
      existing,
      uniqueFields,
    );
  }

  markDuplicates(data: any[], uniqueFields: string[]) {
    const fieldOccurrences: Record<string, Map<string, number>> = {};

    uniqueFields.forEach((field) => {
      fieldOccurrences[field] = new Map();
    });

    data.forEach((item) => {
      uniqueFields.forEach((field) => {
        const value = item[field];
        if (!value) return;
        if (!fieldOccurrences[field].has(value)) {
          fieldOccurrences[field].set(value, 0);
        }
        fieldOccurrences[field].set(
          value,
          fieldOccurrences[field].get(value) + 1,
        );
      });
    });

    data.forEach((item) => {
      uniqueFields.forEach((field) => {
        if (fieldOccurrences[field].get(item[field]) > 1) {
          item.isDuplicate = true;
        }
      });
    });

    return data;
  }

  async compareDuplicateBeneficiary(
    payload: any,
    existingData: any,
    uniqueFields: string[],
  ) {
    const result = [];
    const { hasPhone, hasEmail, hasGovtID, hasWalletAddress } =
      resolveUniqueFields(uniqueFields);
    for (let p of payload) {
      if (hasPhone) {
        p = this.attachIsDuplicate(p, BENEF_UNIQUE_FIELDS.PHONE, existingData);
      }
      if (hasEmail) {
        p = this.attachIsDuplicate(p, BENEF_UNIQUE_FIELDS.EMAIL, existingData);
      }
      if (hasGovtID) {
        p = this.attachIsDuplicate(
          p,
          BENEF_UNIQUE_FIELDS.GOVT_ID_NUMBER,
          existingData,
        );
      }
      if (hasWalletAddress) {
        p = this.attachIsDuplicate(
          p,
          BENEF_UNIQUE_FIELDS.WALLET_ADDRESS,
          existingData,
        );
      }

      result.push(p);
    }
    return result;
  }

  attachIsDuplicate(p: any, fieldName: string, existingData: any) {
    if (p[fieldName]) {
      const found = existingData.find(
        (f) =>
          allowOnlyAlphabetAndNumbers(f[fieldName]) ===
          allowOnlyAlphabetAndNumbers(p[fieldName]),
      );
      if (found) p.isDuplicate = true;
    }
    return p;
  }

  async create(dto: CreateSourceDto) {
    this.logger.log(
      `Create source request received. importId=${dto.importId}, action=${dto.action}`,
    );

    const { action, ...rest } = dto;
    const { data } = dto.fieldMapping;
    if (!data.length) throw new Error('No data found!');

    const uniqueFields = await this.getUniqueFieldSettings();
    this.validateUniqueFields(uniqueFields);

    const hasUUID = data[0].hasOwnProperty(EXTERNAL_UUID_FIELD);
    this.logger.debug(
      `Preparing import payload. records=${
        data.length
      }, hasExternalUUID=${hasUUID}, uniqueFields=${uniqueFields.join(',')}`,
    );

    const payloadWithUUID = data.map((d: any) => {
      if (d.govtIDNumber) d.govtIDNumber = d.govtIDNumber.toString();
      if (d.phone) d.phone = d.phone.toString();
      const formatted = formatEnumFieldValues(d);
      const uid = hasUUID ? d[EXTERNAL_UUID_FIELD] : uuid();
      return {
        ...formatted,
        uuid: uid,
      };
    });
 
    const extraFields = await this.listExtraFields();
    this.logger.debug(
      `Resolved extra field definitions. count=${extraFields.length}`,
    );

    if (action === IMPORT_ACTION.VALIDATE) {
      this.logger.log(`Validation flow started. importId=${dto.importId}`);
      return this.ValidateBeneficiaryImort({
        data: payloadWithUUID,
        extraFields,
        hasUUID,
        uniqueFields,
      });
    }

    if (action === IMPORT_ACTION.IMPORT) {
      this.logger.log(`Import flow started. importId=${dto.importId}`);
      const { allValidationErrors, processedData } = await validateSchemaFields(
        payloadWithUUID,
        extraFields,
        hasUUID,
        uniqueFields,
      );

      if (allValidationErrors.length) {
        this.logger.debug(
          `Import schema validation failed. importId=${dto.importId}, errorCount=${allValidationErrors.length}`,
        );
        throw new Error('Invalid data submitted!');
      }

      this.logger.debug(
        `Import schema validation passed. importId=${dto.importId}, records=${processedData.length}`,
      );

      rest.importField = Enums.ImportField.UUID;
      return this.createSourceAndAddToQueue(rest, processedData);
    }

    this.logger.debug(
      `Create source request ended without matching action. importId=${dto.importId}, action=${action}`,
    );
  }

  async getUniqueFieldSettings() {
    const row: any = await this.prisma.setting.findFirst({
      where: {
        name: SETTINGS_NAMES.UNIQUE_FIELDS,
      },
    });
    if (!row || !row.value)
      throw new Error('Please setup unique fields from settings!');
    return row.value?.DATA.split(',');
  }

  async getMappingsByImportId(importId: string) {
    return this.prisma.source.findUnique({
      where: { importId },
      select: {
        uuid: true,
        importId: true,
        name: true,
        fieldMapping: true,
        isImported: true,
        importProgress: true,
        createdAt: true,
      },
    });
  }

  async listExtraFields() {
    const fd = await this.fdService.listActiveSecondary();
    if (!fd.length) return [];

    return fd.map((item: any) => {
      return {
        name: item.name,
        type: item.fieldType,
        fieldPopulate: item.fieldPopulate,
      };
    });
  }

  validateUniqueFields(fields: string[]) {
    const allowedFields = [
      BENEF_UNIQUE_FIELDS.GOVT_ID_NUMBER,
      BENEF_UNIQUE_FIELDS.PHONE,
      BENEF_UNIQUE_FIELDS.WALLET_ADDRESS,
      BENEF_UNIQUE_FIELDS.EMAIL,
    ];
    if (fields.some((field) => !allowedFields.includes(field))) {
      throw new Error(
        `Allowed unique fields are: [${allowedFields.join(
          ', ',
        )}]. Please check your settings!`,
      );
    }
    return true;
  }

  async ValidateBeneficiaryImort({ data, extraFields, hasUUID, uniqueFields }) {
    this.logger.log(
      `Validate beneficiaries started. records=${data.length}, hasUUID=${hasUUID}`,
    );

    const { allValidationErrors, processedData } = await validateSchemaFields(
      data,
      extraFields,
      hasUUID,
      uniqueFields,  
      false
      
    );
  

    const duplicates = await this.checkDuplicateBeneficiary(
      processedData,
      uniqueFields,
    );


    this.logger.debug(
      `Validate beneficiaries completed. validationErrors=${allValidationErrors.length}, processed=${processedData.length}`,
    );

    const dateParsedDuplicates = duplicates.map((d) => {
      const item = { ...d };
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

  // ─── CSV serialization ──────────────────────────────────────────────────────

  /**
   * Determines which fields on a record are "extras" (not primary DB columns).
   * They get JSON-stringified into a single "extras" CSV column.
   */
  private separateExtras(record: any): {
    primary: any;
    extras: Record<string, any>;
  } {
    const primary: any = {};
    const extras: Record<string, any> = {};

    for (const key of Object.keys(record)) {
      // Skip rawData — it's only needed for the UI mapping step
      if (key === 'rawData') continue;
      if (PRIMARY_BENEFICIARY_FIELDS.has(key)) {
        primary[key] = record[key];
      } else {
        extras[key] = record[key];
      }
    }

    return { primary, extras };
  }

  /**
   * Escapes a value for CSV: wraps in double-quotes and escapes internal quotes.
   */
  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If the string contains comma, newline, or double-quote — wrap in quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  /**
   * Serialises the validated + UUID-assigned records to a CSV Buffer.
   * rawData is stripped. Extra (non-primary) fields are JSON-stringified
   * into the "extras" column.
   */
  serializeToCSV(records: any[]): Buffer {
    const COLUMNS = [
      'uuid',
      'firstName',
      'lastName',
      'phone',
      'email',
      'govtIDNumber',
      'gender',
      'birthDate',
      'walletAddress',
      'location',
      'latitude',
      'longitude',
      'notes',
      'bankedStatus',
      'internetStatus',
      'phoneStatus',
      'extras',
      'createdBy',
    ];

    const header = COLUMNS.join(',');
    const rows = records.map((record) => {
      const { primary, extras } = this.separateExtras(record);
      const extrasJson = Object.keys(extras).length
        ? JSON.stringify(extras)
        : '';

      return COLUMNS.map((col) => {
        if (col === 'extras') return this.escapeCsvValue(extrasJson);
        return this.escapeCsvValue(primary[col]);
      }).join(',');
    });

    return Buffer.from([header, ...rows].join('\n'), 'utf-8');
  }

  // ─── R2 staging ─────────────────────────────────────────────────────────────

  private async uploadStagedCSV(
    importId: string,
    buffer: Buffer,
  ): Promise<string> {
    const key = `imports/${importId}/${Date.now()}.csv`;
    this.logger.debug(
      `Uploading staged CSV to R2. key=${key}, bytes=${buffer.length}`,
    );
    await uploadToR2(this.prisma, buffer, key, 'text/csv');
    return key;
  }

  // ─── Progress tracking ───────────────────────────────────────────────────────

  async updateImportProgress(
    sourceUUID: string,
    patch: Partial<ImportProgress>,
  ) {
    const source = await this.prisma.source.findUnique({
      where: { uuid: sourceUUID },
      select: { importProgress: true },
    });

    const current = (source?.importProgress as unknown as ImportProgress) ?? {
      total: 0,
      imported: 0,
      failed: 0,
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
      error: null,
    };

    const updated = { ...current, ...patch };

    return this.prisma.source.update({
      where: { uuid: sourceUUID },
      data: { importProgress: updated },
    });
  }

  async getImportStatus(uuid: string) {
    const source = await this.prisma.source.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        importId: true,
        name: true,
        isImported: true,
        importProgress: true,
        stagedFileKey: true,
      },
    });
    if (!source) throw new Error(`Source not found: ${uuid}`);
    return source;
  }

  // ─── Queue ──────────────────────────────────────────────────────────────────

  async createSourceAndAddToQueue(
    data: Omit<CreateSourceDto, 'action'>,
    records: any[],
  ) {
    
    this.logger.log(
      `Persisting source and queueing import. importId=${data.importId}`,
    );

    // 1. Serialize validated records to CSV and upload to R2
    const csvBuffer = this.serializeToCSV(records);
    const stagedFileKey = await this.uploadStagedCSV(data.importId, csvBuffer);

    this.logger.debug(
      `Staged CSV uploaded. importId=${data.importId}, key=${stagedFileKey}, records=${records.length}`,
    );

    // Store only the column mapping — not the full data blob.
    // Read sourceTargetMappings as plain objects directly (avoids class-transformer
    // serialisation quirks that would turn class instances into empty arrays).
    const rawMappings = data.fieldMapping?.sourceTargetMappings;
    const sourceTargetMappings = Array.isArray(rawMappings)
      ? rawMappings.map((m: any) => ({
          sourceField: m.sourceField ?? m['sourceField'],
          targetField: m.targetField ?? m['targetField'],
        }))
      : [];

    const fieldMappingToStore = { sourceTargetMappings } as any;

    const initialProgress: ImportProgress = {
      total: records.length,
      imported: 0,
      failed: 0,
      status: 'PENDING',
      startedAt: null,
      completedAt: null,
      error: null,
    };

    // 3. Upsert source row (idempotent on importId)
    const row = await this.prisma.source.upsert({
      where: { importId: data.importId },
      update: {
        name: data.name,
        importField: data.importField,
        createdBy: data.createdBy,
        fieldMapping: fieldMappingToStore,
        stagedFileKey,
        isImported: false,
        importProgress: initialProgress as any,
      },
      create: {
        name: data.name,
        importId: data.importId,
        importField: data.importField,
        createdBy: data.createdBy,
        fieldMapping: fieldMappingToStore,
        stagedFileKey,
        isImported: false,
        importProgress: initialProgress as any,
      },
    });

    // 4. Enqueue the import job
    await this.queueClient.add(
      JOBS.BENEFICIARY.IMPORT,
      { sourceUUID: row.uuid },
      QUEUE_RETRY_OPTIONS,
    );

    this.logger.debug(
      `Source queued successfully. sourceUUID=${row.uuid}, job=${JOBS.BENEFICIARY.IMPORT}`,
    );

    return { message: 'Import queued successfully', sourceUUID: row.uuid };
  }

  // ─── Misc ────────────────────────────────────────────────────────────────────

  async checkDuplicateByExternalUUID(data: any, external_uuid: string) {
    const result = [];
    for (const p of data) {
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
    this.logger.debug(
      `Listing sources. page=${query?.page ?? 1}, perPage=${
        query?.perPage ?? 'default'
      }`,
    );

    const select = {
      uuid: true,
      id: true,
      name: true,
      importId: true,
      isImported: true,
      importProgress: true,
      fieldMapping: true,
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
    this.logger.debug(`Fetching source by uuid=${uuid}`);
    return this.prisma.source.findUnique({ where: { uuid } });
  }

  update(uuid: string, dto: UpdateSourceDto) {
    this.logger.log(`Updating source. uuid=${uuid}`);
    return this.prisma.source.update({
      where: { uuid },
      data: dto as any,
    });
  }

  updateImportFlag(uuid: string, flag: boolean) {
    this.logger.debug(`Updating import flag. uuid=${uuid}, flag=${flag}`);
    return this.prisma.source.update({
      where: { uuid },
      data: { isImported: flag },
    });
  }

  updateStagedFileKey(uuid: string, stagedFileKey: string) {
    this.logger.debug(
      `Updating stagedFileKey. uuid=${uuid}, key=${stagedFileKey}`,
    );
    return this.prisma.source.update({
      where: { uuid },
      data: { stagedFileKey },
    });
  }

  remove(uuid: string) {
    this.logger.log(`Removing source. uuid=${uuid}`);
    return this.prisma.source.delete({
      where: { uuid },
    });
  }
}
