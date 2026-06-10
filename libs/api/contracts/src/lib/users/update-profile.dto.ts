import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizeOptionalString } from '../products/validators.js';

export class UpdateProfileDto {
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsString()
  @IsOptional()
  @MaxLength(120)
  fullName?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[0-9\s.-]+$/, {
    message:
      'phone must contain only digits, spaces, plus signs, dots, or dashes',
  })
  phone?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  avatarUrl?: string;
}
