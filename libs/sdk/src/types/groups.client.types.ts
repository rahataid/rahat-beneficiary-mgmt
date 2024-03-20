import { AxiosRequestConfig } from 'axios';
import { Groups } from '../groups';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export type GroupClient = {
  create: (
    data?: Groups,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  list: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups[]>>;
  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  update: (
    { id, data }: { id?: string; data?: Groups },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
};
