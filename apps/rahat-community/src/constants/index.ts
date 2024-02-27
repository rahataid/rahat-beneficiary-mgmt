export const DB_MODELS = {
  TBL_BENEFICIARY: 'tbl_beneficiaries',
};

export const TARGET_QUERY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

export const QUEUE = {
  TARGETING: 'targeting',
  BENEFICIARY: {
    IMPORT: 'queue.beneficiary.import',
  },
};

export const JOBS = {
  TARGET_BENEFICIARY: 'target_beneficiary',
  BENEFICIARY: { IMPORT: 'job.beneficiary.import' },
  OTP: 'otp',
};

export const EVENTS = {
  CREATE_TARGET_RESULT: 'create_target_result',
  CLEANUP_TARGET_QUERY: 'cleanup.target.query',
  BENEF_SOURCE_CREATED: 'benef.source.created',
};

export const APP = {
  DAYS_TO_DELETE_BENEF_TARGET: 5,
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
