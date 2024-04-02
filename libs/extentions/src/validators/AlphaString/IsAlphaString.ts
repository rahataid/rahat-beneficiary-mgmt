import { registerDecorator, ValidationOptions } from 'class-validator';
import { AlphaStringConstraint } from './AlphaStringConstraint';

export function IsAlphaString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAlphaString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: AlphaStringConstraint,
    });
  };
}
