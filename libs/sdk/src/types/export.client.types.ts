import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';

export type ExportBeneficiaryCsvDto = {
  groupUUID: string;
  startDate?: string;
  endDate?: string;
};

export type ExportToAppDto = {
  groupUUID: string;
  appURL: string;
};

export type ExportClient = {
  exportBeneficiariesCsv: (
    data: ExportBeneficiaryCsvDto,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;

  exportBeneficiariesToApp: (
    data: ExportToAppDto,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<any>>;
};
