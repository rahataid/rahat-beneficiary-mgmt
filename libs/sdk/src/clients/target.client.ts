import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { formatResponse } from '@rumsan/sdk/utils';
import { TargetClient } from '../types';
import {
  PatchResult,
  Result,
  TargetList,
  TargetPost,
  TargetResult,
  TargetResults,
} from '../targets';
import { PaginatedResult } from '@rumsan/sdk/types';
import { Beneficiary } from '../beneficiary';

export const getTargetClient = (client: AxiosInstance): TargetClient => {
  return {
    create: async (data?: TargetPost, config?: AxiosRequestConfig) => {
      const response = await client.post('/targets', data, config);
      return formatResponse<TargetResults>(response);
    },

    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/targets', config);
      return formatResponse<PaginatedResult<TargetList>>(response);
    },

    listByTargetUuid: async (
      target_uuid: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/targets/${target_uuid}/result`,
        config,
      );
      return formatResponse<PaginatedResult<Result>>(response);
    },

    targetSearch: async (data?: TargetPost, config?: AxiosRequestConfig) => {
      const response = await client.post('/targets/search', data, config);
      return formatResponse<Beneficiary[]>(response);
    },

    targetResult: async (data?: TargetResult, config?: AxiosRequestConfig) => {
      const response = await client.post('/targets/targetResult', data, config);
      return formatResponse<TargetResults>(response);
    },

    patchLabel: async (
      { id, label }: { id?: number; label?: string },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(
        `/targets/${id}/label`,
        label,
        config,
      );
      return formatResponse<PatchResult>(response);
    },
    export: async (targetUUID?: string, config?: AxiosRequestConfig) => {
      const response = await client.post(
        `/targets/export/${targetUUID}`,
        config,
      );
      return formatResponse<TargetResults>(response);
    },
  };
};
