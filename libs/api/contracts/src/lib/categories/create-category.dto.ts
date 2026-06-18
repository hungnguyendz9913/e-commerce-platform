import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  normalizeLowerString,
  normalizeOptionalString,
  normalizeRequiredString,
} from '../common/validators.js';
import { CategoryStatus } from '@e-commerce-platform/types';

export class CreateCategoryDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name!: string;

  @Transform(({ value }) => normalizeLowerString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  slug!: string;

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