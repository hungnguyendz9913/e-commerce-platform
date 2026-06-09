import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import {
  normalizeOptionalString,
  normalizeRequiredString,
} from './validators.js';

export class ProductImageDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  imageUrl!: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
