import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BeneficiaryEvents, Enums } from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';
import { DB_MODELS } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { GroupService } from '../groups/group.service';
import { SourceService } from '../sources/source.service';
import { formatDateAndTime } from '../utils';
import { fetchSchemaFields } from './helpers';

const { ImportField } = Enums;

@Injectable()
export class BeneficiaryImportService {
  constructor(
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
    private eventEmitter: EventEmitter2,
    private groupService: GroupService,
    private prisma: PrismaService,
  ) {}

  async splitPrimaryAndExtraFields(data: any) {
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
    const defaultGroup = await this.groupService.upsertByName({
      name: 'default',
      isSystem: true,
      autoCreated: true,
      createdBy,
    });
    const importGroup = await this.groupService.upsertByName({
      name: `import_${formatDateAndTime(new Date())}`,
      autoCreated: true,
      createdBy,
    });
    return {
      defaultGroupUID: defaultGroup.uuid,
      importGroupUID: importGroup.uuid,
    };
  }

  async importBySourceUUID(uuid: string) {
    let upsertCount = 0;
    const source = await this.sourceService.findOne(uuid);
    if (!source) throw new Error('Source not found!');
    if (source.isImported) throw new Error('Beneficiaries  already imported!');
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

    const { defaultGroupUID, importGroupUID } =
      (await this.createDefaultAndImportGroup(source.createdBy)) as any;

    const { importField } = source;
    // Import by UUID
    if (importField === ImportField.UUID) {
      for (let p of appendCreatedBy) {
        upsertCount++;
        await this.benefService.upsertByUUID({
          sourceUID: source.uuid,
          defaultGroupUID,
          importGroupUID,
          beneficiary: p,
        });
        // if (benef) await this.addBenefToSource(benef.uuid, source.uuid);
      }
    }

    await this.sourceService.updateImportFlag(source.uuid, true);
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);

    return {
      success: true,
      status: 200,
      message: `${upsertCount} out of ${final_payload.length} Beneficiaries updated!`,
    };
  }

  async addBenefToSource(benefUID: string, sourceUID: string) {
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
