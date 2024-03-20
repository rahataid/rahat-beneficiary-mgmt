import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GroupClient } from '../types';
import { Groups } from '../groups';
import { formatResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export const getGroupClient = (client: AxiosInstance): GroupClient => {
  return {
    create: async (data?: Groups, config?: AxiosRequestConfig) => {
      const response = await client.post('/group', data, config);
      return formatResponse<Groups>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/group', { params: data, ...config });
      return formatResponse<Groups[]>(response);
    },

    listById: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/group/${id}`, config);
      return formatResponse<Groups>(response);
    },

    update: async (
      { id, data }: { id?: string; data?: Groups },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(`/group/${id}`, data, config);
      return formatResponse<Groups>(response);
    },

    remove: async (id: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/group/${id}`, config);
      return formatResponse<Groups>(response);
    },
  };
};
