import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FieldDefinitionClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { FieldDefinition } from '../fieldDefinitions';
import { Pagination } from '@rumsan/sdk/types';

export const getFieldDefinitionClient = (
  client: AxiosInstance,
): FieldDefinitionClient => {
  return {
    create: async (data?: FieldDefinition, config?: AxiosRequestConfig) => {
      const response = await client.post('/field-definitions', data, config);
      return formatResponse<FieldDefinition>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/field-definitions', {
        params: data,
        ...config,
      });
      return formatResponse<FieldDefinition[]>(response);
    },

    listById: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/field-definitions/${id}`, config);
      return formatResponse<FieldDefinition>(response);
    },

    listActive: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/field-definitions/active', {
        params: data,
        ...config,
      });
      return formatResponse<FieldDefinition[]>(response);
    },

    update: async (
      { id, data }: { id?: string; data?: FieldDefinition },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(
        `/field-definitions/${id}`,
        data,
        config,
      );
      return formatResponse<FieldDefinition>(response);
    },

    toggleStatus: async (
      { id, isActive }: { id: string; isActive: boolean },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(
        `/field-definitions/${id}/status`,
        isActive,
        config,
      );
      return formatResponse<FieldDefinition>(response);
    },
    addBulk: async ({ file }: { file: any }, config?: AxiosRequestConfig) => {
      const response = await client.post(
        '/field-definitions/upload',
        file,
        config,
      );
      return formatResponse<any>(response);
    },
  };
};
