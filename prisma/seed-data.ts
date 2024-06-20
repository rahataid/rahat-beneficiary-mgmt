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
  },
  {
    name: 'longitude',
    fieldType: FieldType.NUMBER,
    isSystem: true,
  },
  {
    name: 'govtIDNumber',
    fieldType: FieldType.TEXT,
    isSystem: true,
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
