import axios from 'axios';
import { Address, signMessage } from 'viem/accounts';

export type TExportBulkBeneficiary = {
  appUrl: string;
  signature: string;
  address: string;
  buffer: any;
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
  console.log('Initiating export with payload:', {
    appUrl,
    signature,
    address,
    bufferSize: buffer.length,
  });

  return new Promise((resolve, reject) => {
    axios(axiosConfig)
      .then((response) => {
        console.log('Export Response:', response.data);
        resolve(response.data);
      })
      .catch((error) => {
        console.error('Export Error:', error);
        const message =
          error?.response?.data?.message || 'Something went wrong';
        console.error('Export Error:', message);
        reject({
          success: false,
          message,
        });
      });
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
