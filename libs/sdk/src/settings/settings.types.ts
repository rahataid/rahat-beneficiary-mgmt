export type SettingResponse = {
  name: string;
  value: Value;
  dataType: string;
  requiredFields: string[];
  isReadOnly: boolean;
  isPrivate: boolean;
};

export type Value = {
  [key: string]: any;
};

export type SettingInput = {
  name: string;
  value: Value;
  requiredFields: string[];
  isReadOnly: boolean | null;
  isPrivate: boolean | null;
};
