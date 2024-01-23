enum Gender {
  Male,
  Female,
  Other,
  Unknown,
}
enum BankedStatus {
  UNKNOWN,
  UNBANKED,
  BANKED,
  UNDER_BANKED,
}

enum InternetStatus {
  UNKNOWN,
  NO_INTERNET,
  HOME_INTERNET,
  MOBILE_INTERNET,
}

enum PhoneStatus {
  UNKNOWN,
  NO_PHONE,
  FEATURE_PHONE,
  SMART_PHONE,
}
export interface BeneficiaryInterface {
  id: number;
  uuid: string;
  custom_id: string;
  firstName: string;
  lastName: string;
  gender?: Gender;
  wallet_address?: string;
  birth_date?: Date;
  location?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  extras?: any;
  notes?: string;
  banked_status?: BankedStatus;
  internet_status?: InternetStatus;
  phone_status?: PhoneStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface SourceInterface {
  id: number;
  uuid: string;
  name: string;
  isImported?: boolean;
  details?: any;
  field_mapping: any;
  created_at: Date;
  updated_at: Date;
}

export interface BeneficiarySourceInterface {
  id: number;
  source_id: number;
  beneficiary_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface FieldDefinitionInterface {
  id: number;
  name: string;
  field_type: string;
  field_populate?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GroupInterface {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface BeneficiaryGroupInterface {
  id: number;
  beneficary_id: number;
  group_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface RoleInterface {
  id: number;
  name: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionInterface {
  id: number;
  roleId: number;
  action: string;
  subject: string;
  inverted?: boolean;
  conditions?: any;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInterface {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  authAddress: string;
  authType: AuthType;
  firstName: string;
  lastName: string;
  roleId: number;
  otp?: string;
}

enum AuthType {
  Email,
  Phone,
  Wallet,
}
