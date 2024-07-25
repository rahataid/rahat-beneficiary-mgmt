import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GroupClient } from '../types';
import {
  GroupInput,
  GroupResponseById,
  GroupResponse,
  ListGroup,
  GroupBeneficiaryQuery,
  GroupPurge,
  GroupMessage,
  RemoveGroup,
} from '../groups';
import { formatResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export const getGroupClient = (client: AxiosInstance): GroupClient => {
  return {
    create: async (data?: GroupInput, config?: AxiosRequestConfig) => {
      const response = await client.post('/group', data, config);
      return formatResponse<GroupResponse>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/group', { params: data, ...config });
      return formatResponse<ListGroup[]>(response);
    },

    listById: async (
      uuid: string,
      query: GroupBeneficiaryQuery,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(`/group/${uuid}`, {
        params: query,
        ...config,
      });
      return formatResponse<GroupResponseById>(response);
    },

    update: async (
      { uuid, data }: { uuid?: string; data?: GroupInput },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(`/group/${uuid}`, data, config);
      return formatResponse<GroupResponse>(response);
    },

    purgeGroup: async (data?: GroupPurge, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/group/purge`, { data, ...config });
      return formatResponse<GroupResponse>(response);
    },

    remove: async (data: RemoveGroup, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/group/remove`, {
        data,
        ...config,
      });
      return formatResponse<GroupResponse>(response);
    },

    download: async ({
      uuid,
      config,
    }: {
      uuid: string;
      config?: AxiosRequestConfig;
    }) => {
      const response = await client.post(`/group/download`, {
        uuid,
        ...config,
        responseType:
          config?.responseType === 'arraybuffer' ? 'arraybuffer' : 'blob',
      });
      return response;
    },
    deleteGroup: async (uuid?: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/group/${uuid}`, config);
      return formatResponse<GroupMessage>(response);
    },
  };
};
