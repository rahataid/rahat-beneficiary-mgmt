export const createPrimaryAndExtraQuery = (
  primary_fields: any,
  keys: any,
  values: any,
) => {
  const primary = {};
  const extra = {};

  for (let i = 0; i < keys.length; i++) {
    const found = primary_fields.find((f: any) => f.name === keys[i]);
    if (found) primary[keys[i]] = values[i];
    else extra[keys[i]] = values[i];
  }

  return { primary, extra };
};

export const createFinalResult = (final_result: any, filteredData: any) => {
  const existing_data = final_result;
  for (const f of filteredData) {
    const found = existing_data.find((d: any) => d.id === f.id);
    if (!found) existing_data.push(f);
  }
  return existing_data;
};
