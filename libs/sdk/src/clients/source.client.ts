import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { SourceClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { Source } from '../source';

export const getSourceClient = (client: AxiosInstance): SourceClient => {
  return {
    create: async (data?: Source, config?: AxiosRequestConfig) => {
      const response = await client.post('/sources', data, config);
      return formatResponse<Source>(response);
    },

    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/sources', config);
      return formatResponse<Source[]>(response);
    },

    listById: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/sources/${uuid}`, config);
      return formatResponse<Source>(response);
    },

    update: async (
      { uuid, data }: { uuid?: string; data?: Source },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(`/sources/${uuid}`, data, config);
      return formatResponse<Source>(response);
    },

    remove: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/sources/${uuid}`, config);
      return formatResponse<Source>(response);
    },

    importIdMapping: async (importId: string, config?: AxiosRequestConfig) => {
      const response = await client.get(
        `/sources/${importId}/mappings`,
        config,
      );
      return formatResponse<any>(response);
    },
  };
};
