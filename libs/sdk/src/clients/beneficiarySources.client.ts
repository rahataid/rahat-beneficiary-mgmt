import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BeneficiarySourcesClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { BeneficiarySources } from '../beneficiarySource';

export const getBeneficiarySourcesClient = (
  client: AxiosInstance,
): BeneficiarySourcesClient => {
  return {
    create: async (data?: BeneficiarySources, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiarySource', data, config);
      return formatResponse<BeneficiarySources>(response);
    },

    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiarySource', config);
      return formatResponse<BeneficiarySources[]>(response);
    },

    listById: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiarySource/${+id}`, config);
      return formatResponse<BeneficiarySources>(response);
    },

    update: async (
      { id, data }: { id?: number; data?: BeneficiarySources },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
        `/beneficiarySource/${id}`,
        data,
        config,
      );
      return formatResponse<BeneficiarySources>(response);
    },

    remove: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/beneficiarySource/${id}`, config);
      return formatResponse<BeneficiarySources>(response);
    },
  };
};
