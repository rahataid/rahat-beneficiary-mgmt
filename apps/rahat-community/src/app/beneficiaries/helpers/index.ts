import { Prisma } from '@prisma/client';

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
