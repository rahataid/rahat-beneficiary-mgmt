export type FieldDefinition = {
  id: number;
  name: string;
  fieldType: string;
  fieldPopulate?: any;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};
