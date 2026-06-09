import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function normalizeRequiredString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

export function normalizeLowerString(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export function toOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value);
}

@ValidatorConstraint({ name: 'reservedQuantityWithinStock', async: false })
export class ReservedQuantityWithinStockConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as {
      stockQuantity?: unknown;
      reservedQuantity?: unknown;
    };
    const stockQuantity = object.stockQuantity;

    if (value === undefined || stockQuantity === undefined) {
      return true;
    }

    return Number(value) <= Number(stockQuantity);
  }

  defaultMessage() {
    return 'reservedQuantity must not exceed stockQuantity';
  }
}
