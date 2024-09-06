import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { CreateBenefComm } from '../beneficiaryComms/beneficiaryComms.types';
import { Pagination } from '@rumsan/sdk/types';

export type BenefCommsClient = {
  create: (
    data: CreateBenefComm,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listBenefComms: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listTransport: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  triggerCommunication: (
    uuid?: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  listBenefCommsByID: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
