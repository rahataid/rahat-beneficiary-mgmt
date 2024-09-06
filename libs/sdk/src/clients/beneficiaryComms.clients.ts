import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BenefCommsClient } from '../types/beneficiaryComms.clients.types';
import { CreateBenefComm } from '../beneficiaryComms/beneficiaryComms.types';
import { formatResponse } from '@rumsan/sdk/utils';
import { Pagination } from '@rumsan/sdk/types';

export const getBeneficiaryCommsClient = (
  client: AxiosInstance,
): BenefCommsClient => {
  return {
    create: async (data: CreateBenefComm, config?: AxiosRequestConfig) => {
      const response = await client.post('/beneficiary-comms', data, config);
      return formatResponse<any>(response);
    },

    listBenefComms: async (data?: Pagination, config?: AxiosRequestConfig) => {
      const response = await client.get('/beneficiary-comms', {
        params: data,
        ...config,
      });
      return formatResponse<any>(response);
    },
    listBenefCommsByID: async (uuid: string, config?: AxiosRequestConfig) => {
      const response = await client.get(`/beneficiary-comms/${uuid}`, config);
      return formatResponse<any>(response);
    },
    listTransport: async (config?: AxiosRequestConfig) => {
      const response = await client.get(
        '/beneficiary-comms/transports',
        config,
      );
      return formatResponse<any>(response);
    },
    triggerCommunication: async (
      uuid?: string,
      config?: AxiosRequestConfig,
    ) => {
      const response = await client.get(
        `/beneficiary-comms/${uuid}/trigger`,
        config,
      );
      return formatResponse<any>(response);
    },
  };
};
