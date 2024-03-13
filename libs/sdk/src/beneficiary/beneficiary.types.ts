import { BankedStatus, Gender, InternetStatus, PhoneStatus } from '../enums';

export type Beneficiary = {
  firstName?: string;
  lastName?: string;
  id?: number;
  uuid?: string;
  gender?: Gender;
  customId?: string;
  walletAddress?: string;
  birthDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  phone: string;
  extras?: any;
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

export type UpdateBeneficiary = {
  firstName?: string;
  lastName?: string;
  id?: number;
  gender?: Gender;
  customId?: string;
  walletAddress?: string;
  birthDate?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  phone: string;
  extras?: any;
  bankedStatus?: BankedStatus;
  internetStatus?: InternetStatus;
  phoneStatus?: PhoneStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

export type ListBeneficiary = {
  firstName: string;
  lastName: string;
  id: number;
  uuid: string;
  gender: Gender;
  customId: string;
  walletAddress: string;
  birthDate: Date;
  location: string;
  latitude: number;
  longitude: number;
  notes: string;
  phone: string;
  extras: any;
  bankedStatus: BankedStatus;
  internetStatus: InternetStatus;
  phoneStatus: PhoneStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
};
