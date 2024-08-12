import axios from 'axios';
import { Address, signMessage } from 'viem/accounts';

export type TExportBulkBeneficiary = {
  appUrl: string;
  signature: string;
  address: string;
  buffer: any;
};

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
  payload: TExportBulkBeneficiary,
): Promise<any> => {
  const { appUrl, signature, address, buffer } = payload;
  if (!appUrl) throw new Error('API endpoint is required');

  const axiosConfig = {
    method: 'post',
    url: appUrl,
    data: buffer,
    headers: {
      'Content-Type': 'application/octet-stream',
      'auth-signature': signature,
      'auth-address': address,
    },
  };

  axios(axiosConfig)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      const message = error?.response?.data?.message || 'Something went wrong';
      console.error('Export Error:', message);
      return {
        success: false,
        message,
      };
    });
};

export const checkPublicKey = (apiUrl: string) => {
  return new Promise((resolve, reject) => {
    axios.get(apiUrl).then(async (response) => {
      resolve(response.data);
    });
  });
};

export const generateSignature = (message: string, privateKey: Address) => {
  return signMessage({ message, privateKey });
};
