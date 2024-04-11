import { AxiosRequestConfig } from 'axios';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';
import { KoboImportInput } from '../app';

export type AppClient = {
  koboImportByForm: (
    data?: KoboImportInput,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
  listKoboSettings: (
    data?: Pagination,
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
};
