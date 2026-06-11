import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  normalizeLowerString,
  normalizeOptionalString,
  normalizeRequiredString,
} from '../products/validators.js';
import { CategoryStatus } from '@e-commerce-platform/types';

export class UpdateCategoryDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsOptional()
  @IsString()
  @MaxLength(180)
  name?: string;

  @Transform(({ value }) => normalizeLowerString(value))
  @IsOptional()
  @IsString()
  @MaxLength(220)
  slug?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}