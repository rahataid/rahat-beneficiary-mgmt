export type FieldDefinition = {
  id?: number;
  name: string;
  fieldType: string;
  fieldPopulate?: any;
  isActive: boolean;
  isUnique: boolean;
  isTargeting: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
