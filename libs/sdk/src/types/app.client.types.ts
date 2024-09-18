import { Pagination } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { FilterStatsDto } from '../app';

export type AppClient = {
  koboImportByForm: (
    name?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listKoboSettings: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  getAppStats: (
    data?: FilterStatsDto,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listBySettingName: (
    name?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listByConstantName: (
    { name, data }: { name?: string; data?: Pagination },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  uploadCommsAudio: (
    file: any,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
