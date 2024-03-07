import { UUID } from 'crypto';

export type Source = {
  uuid?: UUID;
  name: string;
  importId: string;
  isImported?: boolean;
  details?: any;
  fieldMapping?: any;
};

export type SourceResponse = {
  message: string;
};
