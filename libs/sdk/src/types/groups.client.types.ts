import { AxiosRequestConfig } from 'axios';
import {
  GroupBeneficiaryQuery,
  GroupInput,
  GroupMessage,
  GroupPurge,
  GroupResponse,
  GroupResponseById,
  ListGroup,
  RemoveGroup,
  ResultGroup,
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
    query: GroupBeneficiaryQuery,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponseById>>;
  update: (
    { uuid, data }: { uuid?: string; data?: GroupInput },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;

  purgeGroup: (
    data?: GroupPurge,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;

  remove: (
    data: RemoveGroup,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;

  download: ({
    uuid,
    config,
  }: {
    uuid: string;
    config: AxiosRequestConfig;
  }) => Promise<any>;

  deleteGroup: (
    uuid?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupMessage>>;

  bulkGenerateLink: (
    groupUID: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<ResultGroup>>;
};
