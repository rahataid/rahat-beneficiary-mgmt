import { Injectable } from '@nestjs/common';
import { DB_MODELS } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { SourceService } from '../sources/source.service';
import { fetchSchemaFields, injectCustomID } from './helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BeneficiaryEvents } from '@rahataid/community-tool-sdk';
import { ImportField } from '@prisma/client';
import { GroupService } from '../groups/group.service';

@Injectable()
export class BeneficiaryImportService {
  constructor(
    private benefSourceService: BeneficiarySourceService,
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
    private eventEmitter: EventEmitter2,
    private groupService: GroupService,
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

  async createDefaultAndImportGroup() {
    const defaultGroup = await this.groupService.upsertByName({
      name: 'default',
      isSystem: true,
    });
    const importGroup = await this.groupService.upsertByName({
      name: `import_${new Date().toLocaleDateString()}`,
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

    const { defaultGroupUID, importGroupUID } =
      this.createDefaultAndImportGroup() as any;

    const { importField } = source;
    console.log({ importField });
    // Import by UUID
    if (importField === ImportField.UUID) {
      for (let p of final_payload) {
        upsertCount++;
        const benef = await this.benefService.upsertByUUID({
          defaultGroupUID,
          importGroupUID,
          beneficiary: p,
        });
        if (benef) await this.addBenefToSource(benef.id, source.id);
      }
    }
    // Import by GOVT_ID_NUMBER
    if (importField === ImportField.GOVT_ID_NUMBER) {
      for (let p of final_payload) {
        upsertCount++;
        const benef = await this.benefService.upsertByGovtID({
          defaultGroupUID,
          importGroupUID,
          beneficiary: p,
        });
        if (benef) await this.addBenefToSource(benef.id, source.id);
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

  addBenefToSource(beneficiaryId: number, sourceId: number) {
    return this.benefSourceService.create({
      beneficiaryId: beneficiaryId,
      sourceId: sourceId,
    });
  }

  findAll() {
    return `This action returns all beneficiaryImport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficiaryImport`;
  }

  update(id: number) {
    return `This action updates a #${id} beneficiaryImport`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficiaryImport`;
  }
}
