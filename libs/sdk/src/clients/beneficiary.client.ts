import { Pagination } from '@rumsan/sdk/types';
import { formatResponse } from '@rumsan/sdk/utils';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  Beneficiary,
  ImportBeneficiary,
  Stats,
  UpdateBeneficiary,
} from '../beneficiary';
import { BeneficiaryClient, FileResponse, TFile } from '../types';

export const getBeneficiaryClient = (
  client: AxiosInstance,
): BeneficiaryClient => {
  return {
    create: async (data: Beneficiary, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiaries', data, config);
      return formatResponse<Beneficiary>(response);
    },

    createBulk: async (data: Beneficiary[], config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiaries/bulk', data, config);
      return formatResponse<any>(response);
    },

    list: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiaries', {
        params: data,
        ...config,
      });
      return formatResponse<Beneficiary[]>(response);
    },

    listById: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiaries/${uuid}`, config);
      return formatResponse<Beneficiary>(response);
    },

    uploadBenificiary: async (file: any, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiaries/upload', file, config);
      return formatResponse<FileResponse>(response);
    },

    update: async (
      { uuid, payload }: { uuid: string; payload: any },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(
        `/beneficiaries/${uuid}`,
        payload,
        config,
      );
      return formatResponse<Beneficiary>(response);
    },

    remove: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/beneficiaries/${uuid}`, config);
      return formatResponse<Beneficiary>(response);
    },

    importBeneficiary: async (
      source_uuid: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/beneficiary-imports/${source_uuid}/import`,
        config,
      );
      return formatResponse<ImportBeneficiary>(response);
    },

    getBeneficiaryStats: async (config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiaries/stats', config);
      return formatResponse<Stats[]>(response);
    },
  };
};
