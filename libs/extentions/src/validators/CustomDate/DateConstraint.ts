import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateFormat', async: false })
export class IsDateFormatConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false; // Only validate strings
    return /^\d{4}-\d{2}-\d{2}$/.test(value); // Check if string is in YYYY-MM-DD format
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a date in the format YYYY-MM-DD`;
  }
}
