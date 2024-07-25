import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { SettingList } from '../settings/settings.types';
import { Pagination, Setting } from '@rumsan/sdk/types';

export type SettingClient = {
  listSettings: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<SettingList>>;
  create: (
    data: Setting,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
  getByName: (
    name: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
  update: (
    data: Setting,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Setting>>;
};
