export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UKNOWN = 'UNKNOWN',
}

export enum FieldTypeEnum {
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  NUMBER = 'NUMBER',
  PASSWORD = 'PASSWORD',
  RADIO = 'RADIO',
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  DATE = 'DATE',
}

export enum ImportField {
  UUID = 'UUID',
  GOVT_ID_NUMBER = 'GOVT_ID_NUMBER',
}

export enum ArchiveType {
  DELETED = 'DELETED',
  UPDATED = 'UPDATED',
}

export enum BankedStatus {
  UNKNOWN = 'UNKNOWN',
  UNBANKED = 'UNBANKED',
  BANKED = 'BANKED',
  UNDER_BANKED = 'UNDER_BANKED',
}

export enum InternetStatus {
  UNKNOWN = 'UNKNOWN',
  NO_INTERNET = 'NO_INTERNET',
  HOME_INTERNET = 'HOME_INTERNET',
  MOBILE_INTERNET = 'MOBILE_INTERNET',
}

export enum PhoneStatus {
  UNKNOWN = 'UNKNOWN',
  NO_PHONE = 'NO_PHONE',
  FEATURE_PHONE = 'FEATURE_PHONE',
  SMART_PHONE = 'SMART_PHONE',
}

export enum UploadFileType {
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  API = 'API',
  KOBO = 'KOBO',
}

export enum TargetQueryStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}
