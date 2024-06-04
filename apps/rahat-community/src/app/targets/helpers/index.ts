import axios from 'axios';

export const createPrimaryAndExtraQuery = (
  primary_fields: any,
  keys: any,
  values: any,
) => {
  let primary = {};
  let extra = {};

  for (let i = 0; i < keys.length; i++) {
    const found = primary_fields.find((f: any) => f.name === keys[i]);
    if (found) primary[keys[i]] = values[i];
    else extra[keys[i]] = values[i];
  }

  return { primary, extra };
};

export const createFinalResult = (final_result: any, filteredData: any) => {
  let existing_data = final_result;
  for (let f of filteredData) {
    const found = existing_data.find((d: any) => d.id === f.id);
    if (!found) existing_data.push(f);
  }
  return existing_data;
};

export const exportBulkBeneficiary = async (
  apiUrl: string,
  buffer: any,
): Promise<any> => {
  if (!apiUrl) throw new Error('API endpoint is required');

  const axiosConfig = {
    method: 'post',
    url: apiUrl,
    data: buffer,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  };

  axios(axiosConfig)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw new Error(error);
    });
};
