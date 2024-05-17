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
import { PaginatedResult, Pagination } from '@rumsan/sdk/types';
import { Beneficiary } from '../beneficiary';

export const getTargetClient = (client: AxiosInstance): TargetClient => {
  return {
    create: async (data?: TargetPost, config?: AxiosRequestConfig) => {
      const response = await client.post('/targets', data, config);
      return formatResponse<TargetResults>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/targets', {
        params: data,
        ...config,
      });
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
      { uuid, payload }: { uuid: string; payload: any },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.patch(
        `/targets/${uuid}/label`,
        payload,
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

    downloadPinnedBeneficiary: async ({
      target_uuid,
      config,
    }: {
      target_uuid: string;
      config?: AxiosRequestConfig;
    }) => {
      const response = await client.post(`/targets/${target_uuid}/download`, {
        ...config,
        responseType:
          config?.responseType === 'arraybuffer' ? 'arraybuffer' : 'blob',
      });
      return response;
    },
  };
};
