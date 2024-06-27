export const DB_MODELS = {
  TBL_BENEFICIARY: 'tbl_beneficiaries',
};

export const IMPORT_ACTION = {
  VALIDATE: 'VALIDATE',
  IMPORT: 'IMPORT',
};

export const EMAIL_TEMPLATES = {
  LOGIN: 'login',
};

export const TARGET_QUERY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

export const QUEUE = {
  TARGETING: 'targeting',
  BENEFICIARY: 'beneficiary',
};

export const JOBS = {
  TARGET_BENEFICIARY: 'target_beneficiary',
  BENEFICIARY: {
    IMPORT: 'job.beneficiary.import',
    EXPORT: 'job.beneficiary.export',
  },
  OTP: 'otp',
};

export const EVENTS = {
  CREATE_TARGET_RESULT: 'create_target_result',
  CLEANUP_TARGET_QUERY: 'cleanup.target.query',
  BENEF_SOURCE_CREATED: 'benef.source.created',
  CHALLENGE_CREATED: 'rsu.challenge_created',
  OTP_CREATED: 'rsu.otp_created',
};

export const APP = {
  DAYS_TO_DELETE_BENEF_TARGET: 1,
};

export const APP_SETTINGS = {
  EMAIL_CONFIG: 'email',
  CUSTOM_ID: 'customId',
  APPSETTINGS: 'appSettings',
};

export const QUEUE_RETRY_OPTIONS = { attempts: 3, backoff: 2000 };

export const KOBO_URL: string = 'https://kf.kobotoolbox.org/api/v2/assets';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const EXTERNAL_UUID_FIELD = 'uuid';

export const DEFAULT_GROUP = 'default';
