import {
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'resetPasswordMatchesProperty', async: false })
class MatchesPropertyConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [propertyName] = args.constraints as string[];
    const object = args.object as Record<string, unknown>;
    return value === object[propertyName];
  }

  defaultMessage(args: ValidationArguments) {
    const [propertyName] = args.constraints as string[];
    return `${args.property} must match ${propertyName}`;
  }
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @IsString()
  @Validate(MatchesPropertyConstraint, ['password'])
  confirmPassword!: string;
}
