import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BeneficiaryEvents,
  Enums,
  GroupOrigins,
} from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';
import { DB_MODELS, DEFAULT_GROUP } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { GroupService } from '../groups/group.service';
import { SourceService } from '../sources/source.service';
import { formatDateAndTime } from '../utils';

import {
  downloadFromR2,
  archiveInR2,
} from '../export/helpers/r2-upload.helper';
import { Readable } from 'stream';
// csv-parser exports as a default in CommonJS — use require() to get the callable function
// eslint-disable-next-line @typescript-eslint/no-var-requires
const csvParser = require('csv-parser') as () => NodeJS.ReadWriteStream;

const { ImportField } = Enums;

// Primary DB scalar fields — anything else goes into extras
const PRIMARY_FIELDS = new Set([
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
]);

// All staging columns in the exact order of tbl_beneficiary_staging
const STAGING_COLUMNS = [
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

@Injectable()
export class BeneficiaryImportService {
  private readonly logger = new Logger(BeneficiaryImportService.name);

  constructor(
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
    private eventEmitter: EventEmitter2,
    private groupService: GroupService,
    private prisma: PrismaService,
  ) {}

  // ─── CSV parsing ─────────────────────────────────────────────────────────────

  private parseCsvBuffer(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(csvParser())
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // ─── Field splitting ─────────────────────────────────────────────────────────

  /**
   * Splits records coming from the CSV (all TEXT columns) into:
   *  - primary fields that map directly to tbl_beneficiaries columns
   *  - extras: any key that is not a primary field AND is not already in the
   *    "extras" column (which was serialised as JSON during staging upload)
   *
   * The CSV "extras" column holds a JSON string — we parse it back here.
   */
  public splitPrimaryAndExtraFields(
    records: any[],
    createdBy: string,
  ): any[] {
    return records.map((row) => {
      const primary: any = { createdBy };

      // Parse the pre-serialized extras column
      let extras: Record<string, any> = {};
      if (row['extras']) {
        if (typeof row['extras'] === 'string') {
          try {
            extras = JSON.parse(row['extras']);
          } catch {
            // malformed extras — treat as empty
          }
        } else if (typeof row['extras'] === 'object') {
          extras = row['extras'];
        }
      }

      for (const col of STAGING_COLUMNS) {
        if (col === 'extras' || col === 'createdBy') continue;
        if (row[col] !== undefined && row[col] !== '') {
          primary[col] = row[col];
        }
      }

      if (Object.keys(extras).length > 0) {
        primary.extras = extras;
      }

      return primary;
    });
  }

  // ─── Group creation ──────────────────────────────────────────────────────────

  async createDefaultAndImportGroup(createdBy: string) {
    this.logger.debug(
      `Ensuring default/import groups for createdBy=${createdBy}`,
    );

    const defaultGroup = await this.groupService.upsertByName({
      name: DEFAULT_GROUP,
      isSystem: true,
      autoCreated: true,
      origins: [GroupOrigins.IMPORT],
      createdBy,
    });
    const importGroup = await this.groupService.upsertByName({
      name: `import_${formatDateAndTime(new Date())}`,
      autoCreated: true,
      origins: [GroupOrigins.IMPORT],
      createdBy,
    });

    this.logger.debug(
      `Groups ready. defaultGroupUID=${defaultGroup.uuid}, importGroupUID=${importGroup.uuid}`,
    );

    return {
      defaultGroupUID: defaultGroup.uuid,
      importGroupUID: importGroup.uuid,
    };
  }

  // ─── Staging SQL helpers ─────────────────────────────────────────────────────

  /**
   * Escapes a value for safe embedding in a raw SQL string.
   * Nulls become NULL literals; strings have single-quotes escaped.
   */
  private sqlEscape(value: any): string {
    if (value === null || value === undefined || value === '') return 'NULL';
    const str = String(value);
    // Escape single quotes by doubling them
    return `'${str.replace(/'/g, "''")}'`;
  }

  /**
   * Builds a single multi-row INSERT statement for a chunk of records.
   * All values go in as TEXT — the final upsert SQL casts them to the
   * correct Postgres types.
   */
  private buildStagingInsertSQL(records: any[]): string {
    const valueRows = records.map((r) => {
      const vals = STAGING_COLUMNS.map((col) => {
        if (col === 'extras') {
          return this.sqlEscape(r.extras ? JSON.stringify(r.extras) : null);
        }
        return this.sqlEscape(r[col]);
      });
      return `(${vals.join(', ')})`;
    });

    const cols = STAGING_COLUMNS.map((c) => `"${c}"`).join(', ');
    return `INSERT INTO tbl_beneficiary_staging (${cols}) VALUES ${valueRows.join(
      ',\n',
    )}`;
  }

  // ─── Core COPY pipeline ──────────────────────────────────────────────────────

  /**
   * Atomically loads all records from the staging table into:
   *   tbl_beneficiaries  (upsert on uuid)
   *   tbl_beneficiary_groups  (default + import group memberships)
   *   tbl_beneficiary_sources (source link)
   *
   * Everything runs in a single Prisma interactive transaction so a failure
   * at any step rolls back completely.
   */
  public async runCopyPipeline({
    records,
    sourceUID,
    defaultGroupUID,
    importGroupUID,
    onlyUpsert = false,
  }: {
    records: any[];
    sourceUID: string;
    defaultGroupUID: string;
    importGroupUID: string;
    onlyUpsert?: boolean;
  }): Promise<{ imported: number; failed: number }> {
    const CHUNK_SIZE = 1000;

    return this.prisma.$transaction(
      async (tx) => {
        // Step 1 — clear staging table (safe: single-user system)
        await tx.$executeRaw`TRUNCATE TABLE tbl_beneficiary_staging`;
        this.logger.debug('Staging table truncated.');

        // Step 2 — chunked INSERT into staging
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
          const chunk = records.slice(i, i + CHUNK_SIZE);
          const sql = this.buildStagingInsertSQL(chunk);
          await tx.$executeRawUnsafe(sql);
          this.logger.debug(
            `Staging insert chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(
              records.length / CHUNK_SIZE,
            )} done.`,
          );
        }

        // Step 3 — upsert from staging → tbl_beneficiaries (single atomic statement)
        await tx.$executeRaw`
          INSERT INTO tbl_beneficiaries (
            uuid,
            "firstName",
            "lastName",
            phone,
            email,
            "govtIDNumber",
            gender,
            "birthDate",
            "walletAddress",
            location,
            latitude,
            longitude,
            notes,
            "bankedStatus",
            "internetStatus",
            "phoneStatus",
            extras,
            "createdBy",
            "createdAt"
          )
          SELECT
            s.uuid::uuid,
            s."firstName",
            s."lastName",
            s.phone,
            s.email,
            s."govtIDNumber",
            CASE
              WHEN s.gender IN ('MALE','FEMALE','OTHER','UNKNOWN') THEN s.gender::"Gender"
              ELSE 'UNKNOWN'::"Gender"
            END,
            CASE WHEN s."birthDate" IS NOT NULL AND s."birthDate" != ''
              THEN s."birthDate"::timestamptz ELSE NULL END,
            s."walletAddress",
            s.location,
            CASE WHEN s.latitude IS NOT NULL AND s.latitude != ''
              THEN s.latitude::float ELSE NULL END,
            CASE WHEN s.longitude IS NOT NULL AND s.longitude != ''
              THEN s.longitude::float ELSE NULL END,
            s.notes,
            CASE
              WHEN s."bankedStatus" IN ('UNKNOWN','UNBANKED','BANKED','UNDER_BANKED')
                THEN s."bankedStatus"::"BankedStatus"
              ELSE 'UNKNOWN'::"BankedStatus"
            END,
            CASE
              WHEN s."internetStatus" IN ('UNKNOWN','NO_INTERNET','HOME_INTERNET','MOBILE_INTERNET')
                THEN s."internetStatus"::"InternetStatus"
              ELSE 'UNKNOWN'::"InternetStatus"
            END,
            CASE
              WHEN s."phoneStatus" IN ('UNKNOWN','NO_PHONE','FEATURE_PHONE','SMART_PHONE')
                THEN s."phoneStatus"::"PhoneStatus"
              ELSE 'UNKNOWN'::"PhoneStatus"
            END,
            CASE WHEN s.extras IS NOT NULL AND s.extras != ''
              THEN s.extras::jsonb ELSE NULL END,
            s."createdBy",
            NOW()
          FROM tbl_beneficiary_staging s
          ON CONFLICT (uuid) DO UPDATE SET
            "firstName"      = EXCLUDED."firstName",
            "lastName"       = EXCLUDED."lastName",
            phone            = EXCLUDED.phone,
            email            = EXCLUDED.email,
            "govtIDNumber"   = EXCLUDED."govtIDNumber",
            gender           = EXCLUDED.gender,
            "birthDate"      = EXCLUDED."birthDate",
            "walletAddress"  = EXCLUDED."walletAddress",
            location         = EXCLUDED.location,
            latitude         = EXCLUDED.latitude,
            longitude        = EXCLUDED.longitude,
            notes            = EXCLUDED.notes,
            "bankedStatus"   = EXCLUDED."bankedStatus",
            "internetStatus" = EXCLUDED."internetStatus",
            "phoneStatus"    = EXCLUDED."phoneStatus",
            extras           = COALESCE(EXCLUDED.extras, tbl_beneficiaries.extras),
            "updatedAt"      = NOW()
        `;
        this.logger.debug('Beneficiaries upserted from staging.');

    if (!onlyUpsert) {
      // Step 4 — add to default group (INSERT...ON CONFLICT DO NOTHING)
      await tx.$executeRaw`
        INSERT INTO tbl_beneficiary_groups (uuid, "beneficiaryUID", "groupUID", "createdAt")
        SELECT
          gen_random_uuid(),
          b.uuid,
          ${defaultGroupUID}::uuid,
          NOW()
        FROM tbl_beneficiaries b
        JOIN tbl_beneficiary_staging s ON s.uuid = b.uuid::text
        ON CONFLICT ("beneficiaryUID", "groupUID") DO NOTHING
      `;
      this.logger.debug('Default group memberships inserted.');

      // Step 5 — add to import group
      await tx.$executeRaw`
        INSERT INTO tbl_beneficiary_groups (uuid, "beneficiaryUID", "groupUID", "createdAt")
        SELECT
          gen_random_uuid(),
          b.uuid,
          ${importGroupUID}::uuid,
          NOW()
        FROM tbl_beneficiaries b
        JOIN tbl_beneficiary_staging s ON s.uuid = b.uuid::text
        ON CONFLICT ("beneficiaryUID", "groupUID") DO NOTHING
      `;
      this.logger.debug('Import group memberships inserted.');
    }

        // Step 6 — link beneficiaries to source
        await tx.$executeRaw`
          INSERT INTO tbl_beneficiary_sources (uuid, "beneficiaryUID", "sourceUID", "createdAt")
          SELECT
            gen_random_uuid(),
            b.uuid,
            ${sourceUID}::uuid,
            NOW()
          FROM tbl_beneficiaries b
          JOIN tbl_beneficiary_staging s ON s.uuid = b.uuid::text
          ON CONFLICT ("beneficiaryUID", "sourceUID") DO NOTHING
        `;
        this.logger.debug('BeneficiarySource links inserted.');

        // Count how many rows landed in staging (= how many were processed)
        const countResult = await tx.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*)::bigint AS count FROM tbl_beneficiary_staging
        `;
        const imported = Number(countResult[0].count);

        // Step 7 — clean up staging table now that data is safely in tbl_beneficiaries
        await tx.$executeRaw`TRUNCATE TABLE tbl_beneficiary_staging`;
        this.logger.debug('Staging table cleared after successful import.');

        return { imported, failed: 0 };
      },
      { timeout: 300_000 }, // 5-minute transaction timeout for very large imports
    );
  }

  // ─── Main entry point ────────────────────────────────────────────────────────

  async importBySourceUUID(sourceUUID: string) {
    this.logger.log(`Import request started for sourceUUID=${sourceUUID}`);

    const source = await this.sourceService.findOne(sourceUUID);
    if (!source) throw new Error('Source not found!');
    if (source.isImported) {
      this.logger.warn(`Source already imported. sourceUUID=${sourceUUID}`);
      throw new Error('Beneficiaries already imported!');
    }

    if (!source.stagedFileKey) {
      throw new Error(
        `Source has no staged CSV file. sourceUUID=${sourceUUID}. ` +
          `This source may have been created before the R2 pipeline was introduced. ` +
          `Please re-submit the import.`,
      );
    }

    // Mark as in-progress before doing any heavy work
    await this.sourceService.updateImportProgress(sourceUUID, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
    });

    try {
      // 1. Download staged CSV from R2
      this.logger.debug(
        `Downloading staged CSV from R2. key=${source.stagedFileKey}`,
      );
      const csvBuffer = await downloadFromR2(this.prisma, source.stagedFileKey);

      // 2. Parse CSV back to records
      const rawRecords = await this.parseCsvBuffer(csvBuffer);
      this.logger.debug(
        `Parsed CSV. records=${rawRecords.length}, sourceUUID=${sourceUUID}`,
      );

      // 3. Resolve primary vs extras fields
      const records = this.splitPrimaryAndExtraFields(
        rawRecords,
        source.createdBy,
      );

      // 4. Create groups
      const { defaultGroupUID, importGroupUID } =
        await this.createDefaultAndImportGroup(source.createdBy);

      // 5. Run the atomic COPY pipeline
      this.logger.log(
        `Running COPY pipeline. records=${records.length}, sourceUUID=${sourceUUID}`,
      );
      const { imported, failed } = await this.runCopyPipeline({
        records,
        sourceUID: source.uuid,
        defaultGroupUID,
        importGroupUID,
      });

      // 6. Mark source as done
      await this.sourceService.updateImportProgress(sourceUUID, {
        status: 'DONE',
        imported,
        failed,
        completedAt: new Date().toISOString(),
        error: null,
      });
      await this.sourceService.updateImportFlag(sourceUUID, true);

      // Move staged CSV to archive folder in R2 — preserves the file for audit
      try {
        const archiveKey = await archiveInR2(this.prisma, source.stagedFileKey);
        // Update the source row so stagedFileKey points to the new archive location
        await this.sourceService.updateStagedFileKey(sourceUUID, archiveKey);
        this.logger.debug(
          `Staged CSV archived in R2. original=${source.stagedFileKey}, archive=${archiveKey}`,
        );
      } catch (archiveErr) {
        // Non-fatal — log but don't fail the import
        this.logger.warn(
          `Failed to archive staged CSV in R2. key=${source.stagedFileKey}, error=${archiveErr.message}`,
        );
      }

      this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);

      this.logger.log(
        `Import completed. sourceUUID=${sourceUUID}, imported=${imported}, failed=${failed}`,
      );

      return {
        success: true,
        status: 200,
        message: `${imported} beneficiaries imported successfully.`,
      };
    } catch (err) {
      this.logger.error(
        `Import failed. sourceUUID=${sourceUUID}, error=${err.message}`,
      );
      await this.sourceService.updateImportProgress(sourceUUID, {
        status: 'FAILED',
        error: err.message,
        completedAt: new Date().toISOString(),
      });
      // Re-throw so Bull can retry the job
      throw err;
    }
  }

  // ─── Legacy manual re-trigger (kept for backward compat) ─────────────────────

  async addBenefToSource(benefUID: string, sourceUID: string) {
    this.logger.debug(
      `Linking beneficiary to source if absent. benefUID=${benefUID}, sourceUID=${sourceUID}`,
    );

    const rData = await this.prisma.beneficiarySource.findUnique({
      where: {
        benefSourceIdentifier: {
          beneficiaryUID: benefUID,
          sourceUID: sourceUID,
        },
      },
    });
    if (rData) return;
    return this.prisma.beneficiarySource.create({
      data: {
        beneficiaryUID: benefUID,
        sourceUID: sourceUID,
      },
    });
  }

  // for the bulk update
    async processBulkUpdateJob(sourceUUID: string, groupUUID: string, data?:any) {
 
    this.logger.debug(`Processing bulk update job. source=${sourceUUID} group=${groupUUID}`);
      await this.sourceService.updateImportProgress(sourceUUID, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
    });

  
    try {
    const source = await this.prisma.source.findUnique({
      where: { uuid: sourceUUID },
    });
    if (!source) throw new Error('Source not found');
    console.log(source, 'source inside process');

  
    let updatedCount = 0;
    let failedCount = 0;
    
    if (Array.isArray(data) && data.length) {
      for (const row of data) {
        const { uuid, ...rest } = row as any;
  
        const data: any = {};
        for (const [key, value] of Object.entries(rest)) {
          if (PRIMARY_FIELDS.has(key) && value !== undefined && value !== '') {
            data[key] = value;
          }
        }
        try {
          await this.prisma.beneficiary.update({
            where: { uuid },
            data,
          });
          updatedCount++;
        } catch (err) {
          failedCount++;
          this.logger.error(`Failed to update beneficiary ${uuid}: ${err.message}`);
        }
      }
    }

   
    await this.sourceService.updateImportProgress(sourceUUID, {
      imported: ((source.importProgress as any)?.imported || 0) + updatedCount,
      failed: ((source.importProgress as any)?.failed || 0) + failedCount,
      status: 'DONE',
    });

    } catch (err) {
      this.logger.error(`Bulk update failed: ${err.message}`);
      await this.sourceService.updateImportProgress(sourceUUID, {
        status: 'FAILED',
        error: err.message,
        completedAt: new Date().toISOString(),
      });
    }

  }
}
  
