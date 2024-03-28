import { Prisma } from '@prisma/client';
import { uuid } from 'uuidv4';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBeneficiaryDto } from '@community-tool/extentions';

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

function validateEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validatePhone(phoneNumber: string) {
  const phoneRegex = /^\+\d{1,3} \(\d{3}\) \d{3}-\d{4}$/;

  return (
    phoneRegex.test(phoneNumber) &&
    phoneNumber.length > 10 &&
    phoneNumber.length < 20
  );
}

function removeDuplicates(fields: any) {
  const uniqueFields = {};
  fields.forEach((item: any) => {
    uniqueFields[item.fieldName] = item;
  });
  return Object.values(uniqueFields);
}

export const validateKeysAndValues = async (
  customUniqueField: string,
  data: CreateBeneficiaryDto[],
) => {
  const missing_fields = [];
  const myFields = [];
  let reqFields = [
    BENEFICIARY_REQ_FIELDS.FIRST_NAME,
    BENEFICIARY_REQ_FIELDS.LAST_NAME,
  ];
  return myFields;
  if (customUniqueField) reqFields.push(customUniqueField);
  for (let item of data) {
    const beneficiaryDto = plainToClass(CreateBeneficiaryDto, item);
    const errors = await validate(beneficiaryDto);

    const keys = Object.keys(item);
    for (let f of reqFields) {
      let exist = keys.includes(f);
      if (!exist) {
        // Validate keys
        myFields.push({ fieldName: f, isValid: false });
        missing_fields.push(f);
      } else {
        let isValid = true;
        // If exist validate value
        const itemValue = item[f];
        if (f === 'email') isValid = validateEmail(itemValue);
        if (f === 'phone') isValid = validatePhone(itemValue);

        myFields.push({ fieldName: f, isValid });
      }
    }
  }
  const invalidFields = myFields.filter((f) => f.isValid === false);
  const uniqueItems = removeDuplicates(invalidFields);
  return uniqueItems;
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
