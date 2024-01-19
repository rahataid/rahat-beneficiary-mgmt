import { Prisma } from '@prisma/client';
import { uuid } from 'uuidv4';

export const BENEFICIARY_REQ_FIELDS = ['firstName', 'lastName'];

// If not specified duplicate records will be imported!
const CUSTOM_UNIQUE_ID = 'phone';
const GENDER_DB_FIELD = 'gender';

export const DB_FIELD_TYPES = {
  STRING: 'String',
  INTEGER: 'Int',
  DATE_TIME: 'DateTime',
  FLOAT: 'Float',
};

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
      kind: f.kind,
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

// Eg: If target is Float, convert value to Float
export const parseValuesByTargetTypes = (data: any, dbFields: any) => {
  let parsed_result = [];
  for (let d of data) {
    const keys = Object.keys(d);
    const values = Object.values(d);
    const newItem = getFieldTypeAndParse({ keys, values, dbFields, item: d });
    parsed_result = [...parsed_result, newItem];
  }
  return parsed_result;
};

// Get field type using fieldName
function getFieldTypeAndParse({ keys, values, dbFields, item }) {
  const newItem = {};
  for (let i = 0; i < keys.length; i++) {
    const targetField = dbFields.find((f: any) => f.name === keys[i]);
    const parsedvalue = parseToTargetFieldType({
      targetField: targetField.name,
      targetType: targetField.type,
      targetValue: values[i],
      kind: targetField.kind,
    });
    newItem[keys[i]] = parsedvalue;
  }
  return newItem;
}

// Parse value according to target field type
function parseToTargetFieldType({
  targetField,
  targetType,
  targetValue,
  kind,
}) {
  if (kind === 'enum') {
    const currentFieldEnums = ENUM_MAPPING[targetField];
    const validEnum = currentFieldEnums.includes(targetValue);
    if (validEnum) return targetValue;
    const defaultValue =
      targetField === GENDER_DB_FIELD ? 'Unknown' : 'UNKNOWN';
    return defaultValue;
  }
  if (targetType === DB_FIELD_TYPES.INTEGER) return parseInt(targetValue);
  if (targetType === DB_FIELD_TYPES.FLOAT) return parseFloat(targetValue);
  if (targetType === DB_FIELD_TYPES.DATE_TIME) {
    return new Date(targetValue).toISOString();
  }
  return targetValue.toString();
}

const ENUM_MAPPING = {
  gender: ['Male', 'Female', 'Other', 'Unknown'],
  phone_status: ['UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE'],
  internet_status: [
    'UNKNOWN',
    'NO_INTERNET',
    'HOME_INTERNET',
    'MOBILE_INTERNET',
  ],
  banked_status: ['UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED'],
};
