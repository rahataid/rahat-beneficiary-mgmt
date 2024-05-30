import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import {
  PatchResult,
  Result,
  TargetList,
  TargetPost,
  TargetResults,
  TargetResult,
} from '../targets';
import { PaginatedResult, Pagination } from '@rumsan/sdk/types';
import { Beneficiary } from '../beneficiary';

export type TargetClient = {
  create: (
    data?: TargetPost,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<TargetResults>>;

  list: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<PaginatedResult<TargetList>>>;

  listByTargetUuid: (
    { target_uuid, query }: { target_uuid: string; query?: Pagination },

    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<PaginatedResult<Result>>>;

  targetSearch: (
    data?: TargetPost,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary[]>>;

  targetResult: (
    data?: TargetResult,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<TargetResults>>;

  patchLabel: (
    { uuid, payload }: { uuid: string; payload: any },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<PatchResult>>;

  export: (
    targetUUID?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<TargetResults>>;

  downloadPinnedBeneficiary: ({
    target_uuid,
    config,
  }: {
    target_uuid: string;
    config: AxiosRequestConfig;
  }) => Promise<any>;
};
