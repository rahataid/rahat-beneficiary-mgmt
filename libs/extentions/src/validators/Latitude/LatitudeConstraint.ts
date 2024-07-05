import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'latitudeString', async: false })
export class LatitudeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'number') return false;
    if (value < -90 || value > 90) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be between -90 and 90`;
  }
}
