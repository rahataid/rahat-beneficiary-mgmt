import { Injectable } from '@nestjs/common';
import { SourceService } from '../sources/source.service';
import {
  extractFieldsMatchingWithDBFields,
  fetchSchemaFields,
  injectCustomID,
  parseValuesByTargetTypes,
  validateRequiredFields,
} from './helpers';
import { DB_MODELS } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { getCustomUniqueId } from '../settings/setting.config';

@Injectable()
export class BeneficiaryImportService {
  constructor(
    private benefSourceService: BeneficiarySourceService,
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
  ) {}

  async importBySourceUUID(uuid: string) {
    const customUID = getCustomUniqueId();
    const source = await this.sourceService.findOne(uuid);
    if (!source) throw new Error('Source not found!');
    if (source.isImported) return 'Already imported!';
    const jsonData = source.fieldMapping as {
      data: object;
    };
    // 1. Fetch DB_Fields and validate required fields
    const mapped_fields = jsonData.data;
    const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const missing_fields = validateRequiredFields(customUID, mapped_fields);

    if (missing_fields.length) {
      throw new Error(
        `Required fields missing! [${missing_fields.toString()}]`,
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
    const final_payload = injectCustomID(customUID, parsed_data);
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
