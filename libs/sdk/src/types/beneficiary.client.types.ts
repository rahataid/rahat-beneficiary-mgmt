import { Pagination } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import {
  Beneficiary,
  ImportBeneficiary,
  Stats,
  UpdateBeneficiary,
} from '../beneficiary/beneficiary.types';
import { FileResponse } from './response.types';
import { TFile } from './file.types';

export type BeneficiaryClient = {
  create: (
    data: Beneficiary,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  createBulk: (
    data: Beneficiary[],
    config?: AxiosRequestConfig,
  ) => Promise<any>;

  list: (
    data?: Pagination,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary[]>>;

  listById: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  uploadBenificiary: (
    file: any,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FileResponse>>;

  update: (
    { uuid, payload }: { uuid: string; payload: UpdateBeneficiary },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  remove: (
    uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  importBeneficiary: (
    source_uuid: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<ImportBeneficiary>>;

  getBeneficiaryStats: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Stats[]>>;
};
