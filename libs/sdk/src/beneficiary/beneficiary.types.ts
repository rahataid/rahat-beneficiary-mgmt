import { UUID } from 'crypto';
import { BankedStatus, Gender, InternetStatus, PhoneStatus } from '../enums';

export type Beneficiary = {
  uuid?: UUID;
  gender?: Gender;
  walletAddress?: string;
  birthDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  extras?: Record<string, any>;
  notes?: string;
  bankedStatus?: BankedStatus;
  internetStatus?: InternetStatus;
  phoneStatus?: PhoneStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ImportBeneficiary = {
  success?: boolean;
  status?: number;
  message?: string;
};