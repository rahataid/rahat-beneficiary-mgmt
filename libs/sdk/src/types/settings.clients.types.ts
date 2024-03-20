import { FormattedResponse } from '@rumsan/sdk/utils';
import { AxiosRequestConfig } from 'axios';
import {
  SettingInput,
  SettingList,
  SettingResponse,
} from '../settings/settings.types';

export type SettingClient = {
  create: (
    data: SettingInput,
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<SettingResponse>>;

  list: (
    config?: AxiosRequestConfig,
  ) => Promise<FormattedResponse<SettingList>>;
};
