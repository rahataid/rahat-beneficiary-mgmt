import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { formatResponse } from '@rumsan/sdk/utils';
import {
  ExportBeneficiaryCsvDto,
  ExportClient,
  ExportToAppDto,
} from '../types/export.client.types';

export const getExportClient = (client: AxiosInstance): ExportClient => {
  return {
    exportBeneficiariesCsv: async (
      data: ExportBeneficiaryCsvDto,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(
        '/exports/beneficiaries/csv',
        data,
        config,
      );
      return formatResponse<any>(response);
    },

    exportBeneficiariesToApp: async (
      data: ExportToAppDto,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.post(
        '/exports/beneficiaries/app',
        data,
        config,
      );
      return formatResponse<any>(response);
    },
  };
};
