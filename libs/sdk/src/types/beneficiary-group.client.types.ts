import { AxiosRequestConfig } from 'axios';
import { BeneficiaryGroup } from '../beneficiarygroup';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export type BeneficiaryGroupClient = {
  create: (
    data?: BeneficiaryGroup,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  list: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup[]>>;

  listByUUID: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  update: (
    {
      uuid,
      data,
    }: {
      uuid: string;
      data: BeneficiaryGroup;
    },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  remove: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;
};
