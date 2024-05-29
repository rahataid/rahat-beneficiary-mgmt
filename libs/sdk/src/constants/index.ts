import { SUBJECTS as Subject } from '@rumsan/user';

export const APP_JOBS = {
  EMAIL: 'email',
  SLACK: 'slack',
  OTP: 'otp',
};

export const BQUEUE = {
  COMMUNITY: 'COMMUNITY',
  COMMUNITY_BENEFICIARY: 'COMMUNITY.BENEFICIARY',
  HOST: 'COMMUNITY.HOST',
};

export const UserRoles = {
  ADMIN: 'Admin',
  USER: 'User',
  VENDOR: 'Vendor',
};

export const ACTIONS = {
  MANAGE: 'manage',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read',
};

export const SUBJECTS = {
  ...Subject,
  BENEFICIARY: 'beneficiary',
  SOURCE: 'source',
  GROUP: 'group',
  BENEFICIARY_SOURCE: 'beneficiarySource',
  BENEFICIARY_GROUP: 'beneficiaryGroup',
  TARGET: 'target',
  FIELD_DEFINITION: 'fieldDefinition',
  SETTINGS: 'settings',
  BENEFICIARY_IMPORT: 'beneficiary-import',
};

export const APP = {
  JWT_BEARER: 'JWT',
};

export const FIELD_DEF_TYPES = {
  TEXT: 'TEXT',
  DATE: 'DATE',
  NUMBER: 'NUMBER',
  TEXTAREA: 'TEXTAREA',
  RADIO: 'RADIO',
  PASSWORD: 'PASSWORD',
  CHECKBOX: 'CHECKBOX',
  DROPDOWN: 'DROPDOWN',
};

export const REPORTING_FIELD = {
  CASTE: 'caste',
  BANK_NAME: 'bank_name',
  HH_GOVT_ID_TYPE: 'household_head_government_id_type',
  HH_EDUCATION: 'household_head_education_qualification',
  VULNERABILITY_CATEGORY: 'if_yes_which_category',
  TYPE_OF_PHONE_SET: 'type_of_phone_set',
};

export const VALID_AGE_GROUP_KEYS = [
  'female_below_the_age_of_5_years',
  'male_below_the_age_of_5_years',
  '5_18__female',
  '5_18__male',
  '1949_female',
  '1949_male',
  '5065_female',
  '5065_male',
  '65_above_female',
  '65_above_male',
];
