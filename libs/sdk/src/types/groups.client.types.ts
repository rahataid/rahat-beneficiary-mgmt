import { AxiosRequestConfig } from 'axios';
import {
  GroupInput,
  GroupResponse,
  GroupResponseById,
  ListGroup,
} from '../groups';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export type GroupClient = {
  create: (
    data?: GroupInput,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;
  list: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<ListGroup[]>>;
  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponseById>>;
  update: (
    { id, data }: { id?: string; data?: GroupInput },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;
  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;
};
