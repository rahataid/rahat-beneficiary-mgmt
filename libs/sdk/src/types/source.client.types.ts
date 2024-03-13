import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { Source } from '../source';

export type SourceClient = {
  create: (
    data?: Source,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  list: (config?: AxiosRequestConfig) => Promise<FormattedResponse<Source[]>>;
  listById: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  update: (
    { uuid, data }: { uuid?: string; data?: Source },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  remove: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;

  importIdMapping: (
    importId: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
