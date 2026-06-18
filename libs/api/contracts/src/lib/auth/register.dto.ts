import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { normalizeOptionalString } from '../common/validators.js';

@ValidatorConstraint({ name: 'matchesProperty', async: false })
export class MatchesPropertyConstraint implements ValidatorConstraintInterface {
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

export class RegisterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

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

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9\s.-]+$/, {
    message:
      'phone must contain only digits, spaces, plus signs, dots, or dashes',
  })
  phone?: string;
}
