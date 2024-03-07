import { AxiosRequestConfig } from 'axios';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { BeneficiarySources } from '../beneficiarySource';

export type BeneficiarySourcesClient = {
  create: (
    data?: BeneficiarySources,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiarySources>>;

  list: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiarySources[]>>;

  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiarySources>>;

  update: (
    {
      id,
      data,
    }: {
      id: number;
      data: BeneficiarySources;
    },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiarySources>>;

  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiarySources>>;
};
