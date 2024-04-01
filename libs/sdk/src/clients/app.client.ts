import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AppClient } from '../types';
import { formatResponse } from '@rumsan/sdk/utils';
import { KoboImportInput } from '../app';

export const getAppClient = (client: AxiosInstance): AppClient => {
  return {
    koboImportByForm: async (
      data?: KoboImportInput,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(
        `/app/kobo-import/${data?.name}`,
        config,
      );
      return formatResponse<any>(response);
    },

    listKoboSettings: async (data?: {}, config?: AxiosRequestConfig) => {
      const response = await client.get('/app/settings/kobotool', {
        ...config,
      });
      return formatResponse<any>(response);
    },
  };
};
