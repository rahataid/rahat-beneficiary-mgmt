import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FieldDefinitionClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { FieldDefinition } from '../fieldDefinitions';

export const getFieldDefinitionClient = (
  client: AxiosInstance,
): FieldDefinitionClient => {
  return {
    create: async (data?: FieldDefinition, config?: AxiosRequestConfig) => {
      const response = await client.post('/field-definitions', data, config);
      return formatResponse<FieldDefinition>(response);
    },

    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/field-definitions', config);
      return formatResponse<FieldDefinition[]>(response);
    },

    listById: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/field-definitions/${id}`, config);
      return formatResponse<FieldDefinition>(response);
    },

    listActive: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/field-definitions/active', config);
      return formatResponse<FieldDefinition[]>(response);
    },

    update: async (
      { id, data }: { id?: string; data?: FieldDefinition },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
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
  };
};
