import { Pagination } from '@rumsan/sdk/types';
import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import {
  Beneficiary,
  ImportBeneficiary,
} from '../beneficiary/beneficiary.types';
import { FileResponse, Stats } from './response.types';
import { TFile } from './file.types';
import { BeneficiaryGroup } from '../beneficiarygroup';
import { Groups } from '../groups';

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
    uuid: UUID,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  upload: (
    file: TFile,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FileResponse>>;

  update: (
    { uuid, data }: { uuid: UUID; data: Beneficiary },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  remove: (
    uuid: UUID,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Beneficiary>>;

  import_beneficiary: (
    source_uuid: UUID,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<ImportBeneficiary>>;
};

export type BeneficiaryGroupClient = {
  create: (
    data?: BeneficiaryGroup,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  list: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup[]>>;

  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  update: (
    {
      id,
      data,
    }: {
      id: string;
      data: BeneficiaryGroup;
    },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;

  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<BeneficiaryGroup>>;
};

export type GroupClient = {
  create: (
    data?: Groups,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  list: (config?: AxiosRequestConfig) => Promise<FormattedResponse<Groups[]>>;
  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  update: (
    { id, data }: { id?: string; data?: Groups },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
};

export type SourceClient = {
  create: (
    data?: Groups,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  list: (config?: AxiosRequestConfig) => Promise<FormattedResponse<Groups[]>>;
  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  update: (
    { id, data }: { id?: string; data?: Groups },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
  remove: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<Groups>>;
};
