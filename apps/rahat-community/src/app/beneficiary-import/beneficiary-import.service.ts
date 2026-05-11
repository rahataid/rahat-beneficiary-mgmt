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
import { fetchSchemaFields } from './helpers';

const { ImportField } = Enums;

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

  async splitPrimaryAndExtraFields(data: any) {
    this.logger.debug(
      `Splitting primary and extra fields. records=${data?.length ?? 0}`,
    );

    const fields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const primaryFields = fields.map((f) => f.name);

    const modifiedData = data.map((item: any) => {
      const extras = {};
      Object.keys(item).forEach((key) => {
        if (!primaryFields.includes(key) && key !== 'rawData') {
          extras[key] = item[key]; // Move it to extras object
          delete item[key]; // Delete from original object
        }
      });
      // If extras has any key then add it to item
      if (Object.keys(extras).length > 0) {
        item.extras = extras;
      }
      return item;
    });
    return modifiedData;
  }

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

  async importBySourceUUID(uuid: string) {
    this.logger.log(`Import request started for sourceUUID=${uuid}`);

    let upsertCount = 0;
    const source = await this.sourceService.findOne(uuid);
    if (!source) throw new Error('Source not found!');
    if (source.isImported) throw new Error('Beneficiaries  already imported!');

    this.logger.debug(
      `Source loaded for import. sourceUUID=${source.uuid}, importField=${source.importField}`,
    );

    const jsonData = source.fieldMapping as {
      data: object;
    };
    const mapped_fields = jsonData.data;
    const splittedData = await this.splitPrimaryAndExtraFields(mapped_fields);
    const final_payload = splittedData.map((item: any) => {
      delete item.rawData;
      return item;
    });

    const appendCreatedBy = final_payload.map((p) => {
      p.createdBy = source.createdBy;
      return p;
    });

    this.logger.debug(
      `Prepared import payload. totalRecords=${appendCreatedBy.length}, sourceUUID=${source.uuid}`,
    );

    const { defaultGroupUID, importGroupUID } =
      (await this.createDefaultAndImportGroup(source.createdBy)) as any;

    const { importField } = source;
    // Import by UUID
    if (importField === ImportField.UUID) {
      for (const p of appendCreatedBy) {
        upsertCount++;
        await this.benefService.upsertByUUID({
          sourceUID: source.uuid,
          defaultGroupUID,
          importGroupUID,
          beneficiary: p,
        });
        // if (benef) await this.addBenefToSource(benef.uuid, source.uuid);

        if (upsertCount % 50 === 0 || upsertCount === appendCreatedBy.length) {
          this.logger.debug(
            `Import progress sourceUUID=${source.uuid}. processed=${upsertCount}/${appendCreatedBy.length}`,
          );
        }
      }
    }

    await this.sourceService.updateImportFlag(source.uuid, true);
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);

    this.logger.log(
      `Import completed for sourceUUID=${source.uuid}. upserted=${upsertCount}, total=${final_payload.length}`,
    );

    return {
      success: true,
      status: 200,
      message: `${upsertCount} out of ${final_payload.length} Beneficiaries updated!`,
    };
  }

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
}
