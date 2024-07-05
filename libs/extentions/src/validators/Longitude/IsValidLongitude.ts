import { ValidationOptions, registerDecorator } from 'class-validator';
import { LongitudeConstraint } from './LongitudeConstraint';

export function IsValidLongitude(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidLongitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: LongitudeConstraint,
    });
  };
}
