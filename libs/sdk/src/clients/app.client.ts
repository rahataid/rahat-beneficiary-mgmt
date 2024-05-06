import { formatResponse } from '@rumsan/sdk/utils';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AppClient } from '../types';

export const getAppClient = (client: AxiosInstance): AppClient => {
  return {
    koboImportByForm: async (name?: string, config?: AxiosRequestConfig) => {
      const response = await client.post(`/app/kobo-import/${name}`, config);
      return formatResponse<any>(response);
    },

    listKoboSettings: async (data?: {}, config?: AxiosRequestConfig) => {
      const response = await client.get('/app/settings/kobotool', {
        ...config,
      });
      return formatResponse<any>(response);
    },

    listBySettingName: async (name?: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/app/settings/${name}`, config);
      return formatResponse<any>(response);
    },

    listByConstantName: async (
      { name, data }: { name?: string; data?: {} },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(`/app/constants/${name}`, {
        params: data,
        ...config,
      });
      return formatResponse<any>(response);
    },
  };
};
