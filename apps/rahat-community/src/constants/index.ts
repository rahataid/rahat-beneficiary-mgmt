export const DB_MODELS = {
  TBL_BENEFICIARY: 'tbl_beneficiaries',
};

export const TARGET_QUERY_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
};

export const QUEUE = {
  TARGETING: 'targeting',
};

export const JOBS = {
  TARGET_BENEFICIARY: 'target_beneficiary',
  OTP: 'otp',
};

export const EVENTS = {
  CREATE_TARGET_RESULT: 'create_target_result',
  CLEANUP_TARGET_QUERY: 'cleanup.target.query',
};

export const APP = {
  DAYS_TO_DELETE_BENEF_TARGET: 5,
};

export const APP_SETTINGS = {
  EMAIL_CONFIG: 'email',
  CUSTOM_ID: 'customId',
  APPSETTINGS: 'appSettings',
};

export const KOBO_URL: string = 'https://kf.kobotoolbox.org/api/v2/assets';
