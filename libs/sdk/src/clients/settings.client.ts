import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { formatResponse } from '@rumsan/sdk/utils';
import { SettingClient } from '../types/settings.clients.types';
import {
  SettingInput,
  SettingList,
  SettingResponse,
} from '../settings/settings.types';

export const getSettingsClient = (client: AxiosInstance): SettingClient => {
  return {
    create: async (data: SettingInput, config?: AxiosRequestConfig) => {
      const response = await client.post('/settings', data, config);
      return formatResponse<SettingResponse>(response);
    },
    list: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/app/settings', config);
      return formatResponse<SettingList>(response);
    },
  };
};
