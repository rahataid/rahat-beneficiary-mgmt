enum FieldType {
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  NUMBER = 'NUMBER',
  PASSWORD = 'PASSWORD',
  RADIO = 'RADIO',
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  DATE = 'DATE',
}

export const SYSTEM_DB_FIELDS = [
  {
    name: 'householdHeadName',
    fieldType: FieldType.TEXT,
    isSystem: true,
    variations: ['Household Head Name'],
  },
  {
    name: 'firstName',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'lastName',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'gender',
    fieldType: FieldType.DROPDOWN,
    isSystem: true,
    variations: ['Household Head Gender'],
  },
  {
    name: 'birthDate',
    fieldType: FieldType.DATE,
    isSystem: true,
  },
  {
    name: 'walletAddress',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'phone',
    fieldType: FieldType.TEXT,
    isSystem: true,
    variations: ['Household Head Phone Number'],
  },
  {
    name: 'email',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'location',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'latitude',
    fieldType: FieldType.NUMBER,
    isSystem: true,
    variations: ['_GPS_latitude'],
  },
  {
    name: 'longitude',
    fieldType: FieldType.NUMBER,
    isSystem: true,
    variations: ['_GPS_longitude'],
  },
  {
    name: 'govtIDNumber',
    fieldType: FieldType.TEXT,
    isSystem: true,
    variations: ['Government ID Number'],
  },
  {
    name: 'phoneStatus',
    fieldType: FieldType.DROPDOWN,
    isSystem: true,
  },
  {
    name: 'bankedStatus',
    fieldType: FieldType.DROPDOWN,
    isSystem: true,
  },
  {
    name: 'internetStatus',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
  {
    name: 'note',
    fieldType: FieldType.TEXT,
    isSystem: true,
  },
];

export const SETTINGS_NAMES = {
  VERIFICATION_APP: 'VERIFICATION_APP',
  APP_IDENTITY: 'APP_IDENTITY',
  EXTERNAL_APPS: 'EXTERNAL_APPS',
  SMTP: 'SMTP',
};
