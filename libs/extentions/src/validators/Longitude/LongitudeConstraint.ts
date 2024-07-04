import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'longitudeString', async: false })
export class LongitudeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'number') return false;
    if (value < -180 || value > 180) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be between -180 and 180`;
  }
}
