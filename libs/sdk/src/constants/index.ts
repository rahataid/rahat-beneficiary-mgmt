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
