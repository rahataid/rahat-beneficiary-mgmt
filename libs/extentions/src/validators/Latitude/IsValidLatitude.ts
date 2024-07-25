import { ValidationOptions, registerDecorator } from 'class-validator';
import { LatitudeConstraint } from './LatitudeConstraint';

export function IsValidLatitude(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidLatitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: LatitudeConstraint,
    });
  };
}
