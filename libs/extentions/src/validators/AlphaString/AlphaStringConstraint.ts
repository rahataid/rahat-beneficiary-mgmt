import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'alphaString', async: false })
export class AlphaStringConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false; // Only validate strings
    return /^[a-zA-Z0-9\s]+$/.test(value); // Check if string contains only alphabetic characters
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must contain only alphabetic characters`;
  }
}
