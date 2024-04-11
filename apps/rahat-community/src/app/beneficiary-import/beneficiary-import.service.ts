import { Injectable } from '@nestjs/common';
import { DB_MODELS } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { SourceService } from '../sources/source.service';
import { fetchSchemaFields, injectCustomID } from './helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BeneficiaryEvents } from '@community-tool/sdk';

@Injectable()
export class BeneficiaryImportService {
  constructor(
    private benefSourceService: BeneficiarySourceService,
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
    private eventEmitter: EventEmitter2,
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

  async importBySourceUUID(uuid: string) {
    const source = await this.sourceService.findOne(uuid);
    if (!source) throw new Error('Source not found!');
    if (source.isImported) return 'Already imported!';
    const customUniqueField = source.uniqueField || '';
    const jsonData = source.fieldMapping as {
      data: object;
    };
    const mapped_fields = jsonData.data;
    const splittedData = await this.splitPrimaryAndExtraFields(mapped_fields);
    const omitRawData = splittedData.map((item: any) => {
      delete item.rawData;
      return item;
    });
    const final_payload = injectCustomID(customUniqueField, omitRawData);
    let count = 0;

    // // 5. Save Benef and source
    for (let p of final_payload) {
      count++;
      const benef = await this.benefService.upsertByCustomID(p);
      if (benef) {
        await this.benefSourceService.create({
          beneficiaryId: benef.id,
          sourceId: source.id,
        });
      }
    }
    await this.sourceService.updateImportFlag(source.uuid, true);
    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_CREATED);

    return {
      success: true,
      status: 200,
      message: `${count} out of ${final_payload.length} Beneficiaries updated!`,
    };
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
