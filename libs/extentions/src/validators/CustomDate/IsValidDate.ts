import { ValidationOptions, registerDecorator } from 'class-validator';
import { IsDateFormatConstraint } from './DateConstraint';

export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsDateFormatConstraint,
    });
  };
}
