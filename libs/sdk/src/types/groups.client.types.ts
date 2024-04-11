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
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponseById>>;
  update: (
    { uuid, data }: { uuid?: string; data?: GroupInput },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;
  remove: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;

  download: ({
    groupedBeneficiaries,
    config,
  }: {
    groupedBeneficiaries: any[];
    config: AxiosRequestConfig;
  }) => Promise<any>;
};
