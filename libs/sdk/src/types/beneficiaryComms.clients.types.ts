import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import {
  CreateBenefComm,
  LogsPaginations,
} from '../beneficiaryComms/beneficiaryComms.types';
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
  listCommunicationLogsByCampignId: (
    // { uuid, data }: { uuid?: string; data?: LogsPaginations },
    uuid: string,
    data?: LogsPaginations,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
