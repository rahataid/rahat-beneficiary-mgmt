import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BeneficiaryGroup } from '../beneficiarygroup';
import { BeneficiaryGroupClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';

export const getBeneficiaryGroupClient = (
  client: AxiosInstance,
): BeneficiaryGroupClient => {
  return {
    create: async (data?: BeneficiaryGroup, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiary-group', data, config);
      return formatResponse<BeneficiaryGroup>(response);
    },

    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiary-group', config);
      return formatResponse<BeneficiaryGroup[]>(response);
    },

    listById: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiary-group/${id}`, config);
      return formatResponse<BeneficiaryGroup>(response);
    },

    update: async (
      { id, data }: { id: string; data: BeneficiaryGroup },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
        `/beneficiary-group/${id}`,
        data,
        config,
      );
      return formatResponse<BeneficiaryGroup>(response);
    },

    remove: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/beneficiary-group/${id}`, config);
      return formatResponse<BeneficiaryGroup>(response);
    },
  };
};
