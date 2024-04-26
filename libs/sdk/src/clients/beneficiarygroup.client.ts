import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BeneficiaryGroup } from '../beneficiarygroup';
import { BeneficiaryGroupClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export const getBeneficiaryGroupClient = (
  client: AxiosInstance,
): BeneficiaryGroupClient => {
  return {
    create: async (data?: BeneficiaryGroup, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiary-group', data, config);
      return formatResponse<BeneficiaryGroup>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiary-group', {
        params: data,
        ...config,
      });
      return formatResponse<BeneficiaryGroup[]>(response);
    },

    listByUUID: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiary-group/${uuid}`, config);
      return formatResponse<BeneficiaryGroup>(response);
    },

    update: async (
      { uuid, data }: { uuid: string; data: BeneficiaryGroup },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
        `/beneficiary-group/${uuid}`,
        data,
        config,
      );
      return formatResponse<BeneficiaryGroup>(response);
    },

    remove: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(
        `/beneficiary-group/${uuid}`,
        config,
      );
      return formatResponse<BeneficiaryGroup>(response);
    },
  };
};
