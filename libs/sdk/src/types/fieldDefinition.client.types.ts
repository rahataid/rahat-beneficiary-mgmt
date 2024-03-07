import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import { FieldDefinition } from '../fieldDefinitions';

export type FieldDefinitionClient = {
  create: (
    data?: FieldDefinition,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition>>;
  list: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition[]>>;
  listById: (
    id: string,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition>>;
  listActive: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition[]>>;
  update: (
    { id, data }: { id?: string; data?: FieldDefinition },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition>>;
  toggleStatus: (
    { id, isActive }: { id: string; isActive: boolean },
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<FieldDefinition>>;
};
