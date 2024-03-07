import { UUID } from 'crypto';

export type Source = {
  id: number;
  uuid?: UUID;
  name: string;
  isImported?: boolean;
  details?: any;
  fieldMapping: any;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SourceResponse = {
  message: string;
};
