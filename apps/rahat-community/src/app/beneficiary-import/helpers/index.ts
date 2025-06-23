import { Prisma } from '@prisma/client';
import { uuid } from 'uuidv4';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBeneficiaryDto } from '@rahataid/community-tool-extensions';
import {
  DB_MODELS,
  EXTERNAL_UUID_FIELD,
} from 'apps/rahat-community/src/constants';
import { FIELD_DEF_TYPES } from '@rahataid/community-tool-sdk';

export const BENEFICIARY_REQ_FIELDS = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
};

export const BENEF_UNIQUE_FIELDS = {
  PHONE: 'phone',
  EMAIL: 'email',
  GOVT_ID_NUMBER: 'govtIDNumber',
  WALLET_ADDRESS: 'walletAddress',
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

export const validateSchemaFields = async (
  payload: any,
  extraFields: IExtraField[],
  hasUUID: boolean,
  uniqueFields: string[],
) => {
  let requiredFields = [
    BENEFICIARY_REQ_FIELDS.FIRST_NAME,
    BENEFICIARY_REQ_FIELDS.LAST_NAME,
    ...uniqueFields,
  ];
  // if (customUniqueField) requiredFields.push(customUniqueField);
  if (hasUUID) requiredFields.push(EXTERNAL_UUID_FIELD);
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
      let val = value ? value : 0;
      return !isNaN(parseInt(val)) && isFinite(parseInt(val));
    case FIELD_DEF_TYPES.TEXT:
      return typeof value === 'string' || typeof value === 'number';
    case FIELD_DEF_TYPES.DROPDOWN:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    case FIELD_DEF_TYPES.RADIO:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    case FIELD_DEF_TYPES.CHECKBOX:
      return checkIfPopulateValuesMatch(fieldName, value, extraFields);
    case FIELD_DEF_TYPES.DATE:
      return isValidDateFormat(value);
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
  const v = value.toString().trim();
  const isValid = values.includes(v);
  return isValid;
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
    for (let f of requiredFields) {
      if (!item[f]) {
        emptyFields.push(f);
        primaryErrors.push({
          uuid: item.uuid,
          fieldName: f,
          value: '',
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
      newObj[field] = newObj[field] || ''; //
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

function isValidDateFormat(dateString: string) {
  // Regular expression to match the YYYY-MM-DD format
  var dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the string matches the desired format
  if (!dateFormat.test(dateString)) {
    return false;
  }

  // Further validation for the date parts
  var parts = dateString.split('-');
  var year = parseInt(parts[0]);
  var month = parseInt(parts[1]);
  var day = parseInt(parts[2]);

  // Check if month and day values are within valid ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Check for specific cases like February with 30 or 31 days
  if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30) {
    return false;
  }

  if (month == 2) {
    var isLeapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    if ((isLeapYear && day > 29) || (!isLeapYear && day > 28)) {
      return false;
    }
  }

  // If all validations pass, return true
  return true;
}

export const formatEnumFieldValues = (item: any) => {
  if (item.phone && !item.phoneStatus) {
    item.phoneStatus = 'SMART_PHONE';
  }

  if (
    item.bank_name &&
    item.bank_ac_number &&
    item.bank_ac_name &&
    !item.bankedStatus
  ) {
    item.bankedStatus = 'BANKED';
  }
  if (item.gender) item.gender = item.gender.toUpperCase();
  if (item.phoneStatus) item.phoneStatus = item.phoneStatus.toUpperCase();
  if (item.bankedStatus) item.bankedStatus = item.bankedStatus.toUpperCase();
  if (item.internetStatus)
    item.internetStatus = item.internetStatus.toUpperCase();
  return item;
};

export const resolveUniqueFields = (uniqueFields: string[]) => {
  const rData = {
    hasPhone: false,
    hasEmail: false,
    hasGovtID: false,
    hasWalletAddress: false,
  };
  if (uniqueFields.includes(BENEF_UNIQUE_FIELDS.PHONE)) rData.hasPhone = true;
  if (uniqueFields.includes(BENEF_UNIQUE_FIELDS.EMAIL)) rData.hasEmail = true;
  if (uniqueFields.includes(BENEF_UNIQUE_FIELDS.GOVT_ID_NUMBER))
    rData.hasGovtID = true;
  if (uniqueFields.includes(BENEF_UNIQUE_FIELDS.WALLET_ADDRESS))
    rData.hasWalletAddress = true;
  return rData;
};
