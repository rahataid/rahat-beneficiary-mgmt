import { registerDecorator, ValidationOptions } from 'class-validator';
import {parsePhoneNumberFromString}  from 'libphonenumber-js';

export function IsValidPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          try {
            const phoneNumber = parsePhoneNumberFromString(value);
            return phoneNumber?.isValid() || false;
          } catch {
            return false;
          }
        },
        defaultMessage: () =>
          'Phone number must be a valid E.164 format (e.g. +9779841234567)',
      },
    });
  };
}
