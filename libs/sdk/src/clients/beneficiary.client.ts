import { Pagination } from '@rumsan/sdk/types';
import { formatResponse } from '@rumsan/sdk/utils';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { UUID } from 'crypto';
import { Beneficiary, ImportBeneficiary } from '../beneficiary';
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

    listById: async (uuid: UUID, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiaries/${uuid}`, config);
      return formatResponse<Beneficiary>(response);
    },

    upload: async (file: TFile, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiaries/upload', file, config);
      return formatResponse<FileResponse>(response);
    },

    update: async (
      { uuid, data }: { uuid: UUID; data: Beneficiary },
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.put(`/beneficiaries/${uuid}`, data, config);
      return formatResponse<Beneficiary>(response);
    },

    remove: async (uuid: UUID, config?: AxiosRequestConfig) => {
      const response = await client.delete(`/beneficiaries/${uuid}`, config);
      return formatResponse<Beneficiary>(response);
    },

    import_beneficiary: async (
      source_uuid: UUID,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/beneficiary-imports/${source_uuid}/import`,
        config,
      );
      return formatResponse<ImportBeneficiary>(response);
    },
  };
};
