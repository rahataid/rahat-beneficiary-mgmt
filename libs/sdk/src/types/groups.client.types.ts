import { AxiosRequestConfig } from 'axios';
import {
  GroupBeneficiaryQuery,
  GroupInput,
  GroupPurge,
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
    {
      uuid,
      deleteBeneficiaryFlag,
    }: { uuid: string; deleteBeneficiaryFlag: boolean },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<GroupResponse>>;

  download: ({
    uuid,
    config,
  }: {
    uuid: string;
    config: AxiosRequestConfig;
  }) => Promise<any>;
};
