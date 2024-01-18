import { Prisma } from '@prisma/client';
import { uuid } from 'uuidv4';

export const BENEFICIARY_REQ_FIELDS = ['firstName', 'lastName'];

const CUSTOM_UNIQUE_ID = 'phone';

export const DB_FIELD_TYPES = {
  STRING: 'String',
  INTEGER: 'Int',
  DATE_TIME: 'DateTime',
  FLOAT: 'Float',
};

// CHECK: if custom_id is enabled
// ===>IF: enabled => custom_id = enabled_key_value
// ===>ELSE: custom_id = uuid()
export const injectCustomID = (payload: any) => {
  const final = [];
  for (let p of payload) {
    const newItem = { ...p };
    if (CUSTOM_UNIQUE_ID) {
      newItem.custom_id = p[CUSTOM_UNIQUE_ID];
    } else newItem.custom_id = uuid();
    final.push(newItem);
  }
  return final;
};

export const validateRequiredFields = (payload: any) => {
  if (CUSTOM_UNIQUE_ID) BENEFICIARY_REQ_FIELDS.push(CUSTOM_UNIQUE_ID);
  const missing_fields = [];
  for (let item of payload) {
    const keys = Object.keys(item);
    for (let f of BENEFICIARY_REQ_FIELDS) {
      let exist = keys.includes(f);
      if (!exist) missing_fields.push(f);
    }
  }
  const unique_only = [...new Set(missing_fields)];
  return unique_only;
};

export const fetchSchemaFields = (dbModelName: string) => {
  const dbModels = Prisma.dmmf.datamodel.models;
  const model = dbModels.find((f) => f.dbName === dbModelName);
  const { fields } = model;
  const result = fields.map((f) => {
    return {
      name: f.name,
      type: f.type,
    };
  });
  return result;
};

export const extractFieldsMatchingWithDBFields = (
  dbFields: any,
  payload: any,
) => {
  let matching_fields = [];
  for (let p of payload) {
    const keys = Object.keys(p);
    const valid = validateKeysAndDBFields(keys, dbFields);
    matching_fields = valid;
  }
  return extractFields(payload, matching_fields);
};

function validateKeysAndDBFields(keys: any, dbFields: any) {
  const validFields = [];
  for (let i = 0; i < keys.length; i++) {
    const found = dbFields.find((f: any) => f.name === keys[i]);
    if (found) validFields.push(keys[i]);
  }
  return validFields;
}

function extractFields(payload: any, fieldsToSelect: any) {
  const extractedArray = payload.map((obj: any) => {
    const extractedObject = {};
    fieldsToSelect.forEach((field: any) => {
      if (field in obj) {
        extractedObject[field] = obj[field];
      }
    });
    return extractedObject;
  });
  return extractedArray;
}

export const parseValuesByTargetTypes = (data: any, dbFields: any) => {
  let parsed_result = [];
  for (let d of data) {
    const keys = Object.keys(d);
    const values = Object.values(d);
    const result = getFieldTypeAndParse({ keys, values, dbFields, item: d });
    parsed_result = [...parsed_result, result[0]];
  }
  return parsed_result;
};

function getFieldTypeAndParse({ keys, values, dbFields, item }) {
  const result = [];
  for (let i = 0; i < keys.length; i++) {
    const newItem = { ...item };
    const targetField = dbFields.find((f: any) => f.name === keys[i]);
    const parsedvalue = parseToTargetFieldType(targetField.type, values[i]);
    newItem[keys[i]] = parsedvalue;
    result.push(newItem);
  }
  return result;
}

function parseToTargetFieldType(targetType: any, value: any) {
  if (targetType === DB_FIELD_TYPES.INTEGER) return parseInt(value);
  if (targetType === DB_FIELD_TYPES.FLOAT) return parseFloat(value);
  if (targetType === DB_FIELD_TYPES.DATE_TIME) {
    return new Date(value).toISOString();
  }
  return value.toString();
}

// ==============NOT IN USE BELOW THIS====================

export const validateFieldAndTypes = (dbFields: any, dto: any) => {
  let hasInvalidfields = [];
  for (let d of dto) {
    const keys = Object.keys(d);
    // const values = Object.values(d);
    const { invalidFields } = validateKeys({
      keys,
      dbFields,
    });
    invalidFields.pop();
    hasInvalidfields = fileterIdAndRawdataKeys(invalidFields);
  }
  return hasInvalidfields;
};

function validateKeys({ keys, dbFields }) {
  const invalidFields = [];
  for (let i = 0; i < keys.length; i++) {
    const found = dbFields.find((f: any) => f.name === keys[i]);
    if (!found) invalidFields.push(keys[i]);
    else {
      // Also check data type
      //   const valueType = typeof values[i];
      //   console.log('DB_Type=>', found.type);
      //   console.log('KOBO_Type=>', valueType);
    }
  }
  return { invalidFields };
}

function fileterIdAndRawdataKeys(keys: any) {
  let idFiltered = keys.filter((k: any) => k !== '_id');
  let rawDataFiltered = idFiltered.filter((k: any) => k !== 'rawData');
  return rawDataFiltered;
}
