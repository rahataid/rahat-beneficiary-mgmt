export type FieldDefinition = {
  id?: number;
  name: string;
  fieldType: string;
  fieldPopulate?: any;
  isActive: boolean;
  isTargeting: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
