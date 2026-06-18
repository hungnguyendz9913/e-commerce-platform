import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function RequireFieldIfMatches(
  targetProperty: string,
  targetValue: any,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isRequiredIfMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [targetProperty, targetValue],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValue] = args.constraints;
          const currentRelatedValue = (args.object as any)[relatedPropertyName];

          if (currentRelatedValue === relatedValue) {
            if (value === undefined || value === null) return false;
            if (Array.isArray(value) && value.length === 0) return false;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValue] = args.constraints;
          return `${args.property} must not be empty when ${relatedPropertyName} is "${relatedValue}"`;
        },
      },
    });
  };
}