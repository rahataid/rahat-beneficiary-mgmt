import { Prisma } from '@prisma/client';
import { uuid } from 'uuidv4';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBeneficiaryDto } from '@rahataid/community-tool-extensions';
import { DB_MODELS } from 'apps/rahat-community/src/constants';
import { FIELD_DEF_TYPES } from '@rahataid/community-tool-sdk';

export const BENEFICIARY_REQ_FIELDS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
};

export const PRISMA_FIELD_TYPES = {
  STRING: 'String',
  INTEGER: 'Int',
  DATE_TIME: 'DateTime',
  FLOAT: 'Float',
};

interface IExtraField {
  name: string;
  type: string;
}

export const injectCustomID = (customUniqueField: string, payload: any) => {
  const final = [];
  for (let p of payload) {
    const newItem = { ...p };
    if (customUniqueField) {
      newItem.customId = p[customUniqueField];
    } else newItem.customId = uuid();
    final.push(newItem);
  }
  return final;
};

function removeDuplicatesByObjectKey(fields: any) {
  const uniqueFields = {};
  fields.forEach((item: any) => {
    uniqueFields[item.fieldName] = item;
  });
  return Object.values(uniqueFields);
}

export const validateSchemaFields = async (
  customUniqueField: string,
  payload: any,
  extraFields: IExtraField[],
) => {
  let requiredFields = [
    BENEFICIARY_REQ_FIELDS.FIRST_NAME,
    BENEFICIARY_REQ_FIELDS.LAST_NAME,
  ];
  if (customUniqueField) requiredFields.push(customUniqueField);
  const { primaryErrors, processedData } = await validatePrimaryFields(
    payload,
    requiredFields,
  );
  const secondaryErrors = await validateSecondaryFields(payload, extraFields);

  const allValidationErrors = [...primaryErrors, ...secondaryErrors];
  return { allValidationErrors, processedData };
};

// Validate extras fields
const validateSecondaryFields = async (
  payload: any,
  extraFields: IExtraField[],
) => {
  const secondaryErrors = [];
  const dbFields = await fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
  const primaryFields = dbFields.map((f) => f.name);
  payload.map((item: any) => {
    Object.keys(item).forEach((key) => {
      if (!primaryFields.includes(key) && key !== 'rawData') {
        // This is extra field
        const val = item[key];
        const found = extraFields.find((f) => f.name === key);
        if (found) {
          const isValid = validateValueByType({
            value: val,
            type: found.type,
            fieldName: key,
            extraFields,
          });
          if (!isValid) {
            secondaryErrors.push({
              uuid: item.uuid,
              fieldName: key,
              value: val,
              message: "Invalid value for field '" + key + "'",
            });
          }
        }
      }
    });
  });
  return secondaryErrors;
};

function validateValueByType({ value, type, fieldName, extraFields }) {
  switch (type.toUpperCase()) {
    case FIELD_DEF_TYPES.NUMBER:
      return !isNaN(parseInt(value)) && isFinite(parseInt(value));
    case FIELD_DEF_TYPES.TEXT:
      return typeof value === 'string' && value.trim() !== '';
    case FIELD_DEF_TYPES.DROPDOWN:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    case FIELD_DEF_TYPES.RADIO:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    case FIELD_DEF_TYPES.CHECKBOX:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    default:
      return true;
  }
}

function checkIfPopulateValuesMatch(
  fieldName: string,
  value: string,
  extraFields: any,
) {
  const values = getPopulateFieldValues(fieldName, extraFields);
  return values.includes(value);
}

function getPopulateFieldValues(fieldName: string, extraFields: any) {
  const found = extraFields.find((f: any) => f.name === fieldName);
  if (!found) return [];
  const values = found.fieldPopulate?.data?.map((d: any) => d.value) || [];
  return values;
}

const validatePrimaryFields = async (
  payload: any,
  requiredFields: string[],
) => {
  let emptyFields = [];
  const primaryErrors = [];

  for (let item of payload) {
    const beneficiaryDto = plainToInstance(CreateBeneficiaryDto, item);
    const errors = await validate(beneficiaryDto);
    if (errors.length) {
      for (let e of errors) {
        primaryErrors.push({
          uuid: item.uuid,
          fieldName: e.property,
          value: item[e.property],
          message: "Invalid value for field '" + e.property + "'",
        });
      }
    }

    // Required fields validation
    const keys = Object.keys(item);
    for (let f of requiredFields) {
      let exist = keys.includes(f);
      if (!exist) {
        // Required field is missing
        emptyFields.push(f);
        primaryErrors.push({
          uuid: item.uuid,
          fieldName: f,
          value: null,
          isNull: true,
          message: 'Required field is missing',
        });
      }
    }
  }
  const processedData = addEmptyFieldsToPayload(payload, emptyFields);
  return { primaryErrors, processedData };
};

const addEmptyFieldsToPayload = (payload: any, emptyFields: string[]) => {
  const result = payload.map((obj) => {
    const newObj = { ...obj };
    emptyFields.forEach((field) => {
      newObj[field] = null; //
    });
    return newObj;
  });
  return result;
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
    const validEnum = currentFieldEnums.includes(targetValue.toUpperCase());
    if (validEnum) return targetValue.toUpperCase();
    const defaultValue = 'UNKNOWN';
    return defaultValue;
  }
  if (targetType === PRISMA_FIELD_TYPES.INTEGER) return parseInt(targetValue);
  if (targetType === PRISMA_FIELD_TYPES.FLOAT) return parseFloat(targetValue);
  if (targetType === PRISMA_FIELD_TYPES.DATE_TIME) {
    return new Date(targetValue).toISOString();
  }
  return targetValue.toString();
}

// Key must match with schema field name
const ENUM_MAPPING = {
  gender: ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'],
  phoneStatus: ['UNKNOWN', 'NO_PHONE', 'FEATURE_PHONE', 'SMART_PHONE'],
  internetStatus: [
    'UNKNOWN',
    'NO_INTERNET',
    'HOME_INTERNET',
    'MOBILE_INTERNET',
  ],
  bankedStatus: ['UNKNOWN', 'UNBANKED', 'BANKED', 'UNDER_BANKED'],
};
