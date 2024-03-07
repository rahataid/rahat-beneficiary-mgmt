import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { Source } from '../source';
import { UUID } from 'crypto';

export type SourceClient = {
  create: (
    data?: Source,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  list: (config?: AxiosRequestConfig) => Promise<FormattedResponse<Source[]>>;
  listById: (
    uuid: UUID,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  update: (
    { uuid, data }: { uuid?: UUID; data?: Source },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;
  remove: (
    uuid: UUID,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Source>>;

  importIdMapping: (
    importId: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
