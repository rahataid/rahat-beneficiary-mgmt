import { Injectable } from '@nestjs/common';
import { UpdateBeneficiaryImportDto } from './dto/update-beneficiary-import.dto';
import { SourceService } from '../source/source.service';
import {
  extractFieldsMatchingWithDBFields,
  fetchSchemaFields,
  injectCustomID,
  parseValuesByTargetTypes,
  validateRequiredFields,
} from './helpers';
import { DB_MODELS } from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiarySourceService } from '../beneficiary-source/beneficiary-source.service';

@Injectable()
export class BeneficiaryImportService {
  constructor(
    private benefSourceService: BeneficiarySourceService,
    private sourceService: SourceService,
    private benefService: BeneficiariesService,
  ) {}

  async importBySourceUUID(uuid: string) {
    const source = await this.sourceService.findOne(uuid);
    if (!source) throw new Error('Source not found!');

    if (source.isImported) {
      throw new Error('Beneficiaries from this source already imported!');
    }
    const jsonData = source.field_mapping as {
      data: object;
    };
    // 1. Fetch DB_Fields and validate required fields
    const mapped_fields = jsonData.data;
    const dbFields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const missing_fields = validateRequiredFields(mapped_fields);

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
    const final_payload = injectCustomID(parsed_data);
    let count = 0;

    // // 5. Save Benef and source
    for (let p of final_payload) {
      count++;
      const benef = await this.benefService.upsertByCustomID(p);
      if (benef) {
        await this.benefSourceService.create({
          beneficiary_id: benef.id,
          source_id: source.id,
        });
      }
    }
    await this.sourceService.updateImportFlag(source.uuid, true);
    return {
      success: true,
      status: 200,
      message: `${count} out of ${final_payload.length} Beneficiaries imported!`,
    };
  }

  findAll() {
    return `This action returns all beneficiaryImport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beneficiaryImport`;
  }

  update(id: number, updateBeneficiaryImportDto: UpdateBeneficiaryImportDto) {
    return `This action updates a #${id} beneficiaryImport`;
  }

  remove(id: number) {
    return `This action removes a #${id} beneficiaryImport`;
  }
}
