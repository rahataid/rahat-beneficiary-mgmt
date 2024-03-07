import { UUID } from 'crypto';

export type Source = {
  id: number;
  uuid?: UUID;
  name: string;
  isImported?: boolean;
  details?: any;
  fieldMapping: any;
  created_at?: Date;
  updated_at?: Date;
};

export type SourceResponse = {
  message: string;
};
