import { Pagination } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';

export type AppClient = {
  koboImportByForm: (
    name?: string,
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
