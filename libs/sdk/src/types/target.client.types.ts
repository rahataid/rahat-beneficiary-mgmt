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
import { PaginatedResult } from '@rumsan/sdk/types';
import { Beneficiary } from '../beneficiary';

export type TargetClient = {
  create: (
    data?: TargetPost,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<TargetResults>>;

  list: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<PaginatedResult<TargetList>>>;

  listByTargetUuid: (
    target_uuid: string,
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
    { id, label }: { id?: number; label?: string },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<PatchResult>>;

  export: (
    targetUUID?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<TargetResults>>;
};
