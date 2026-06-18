import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ProductApprovalStatus,
  ProductSortField,
  ProductStatus,
  SortOrder,
} from './product.enums.js';
import { normalizeOptionalString, toOptionalNumber } from '../common/validators.js';

function toOptionalBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return value;
}

export class ListProductsQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Transform(({ value }) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;

  @Transform(({ value }) => toOptionalNumber(value))
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxPrice?: number;

  @Transform(({ value }) => toOptionalBoolean(value))
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductApprovalStatus)
  approvalStatus?: ProductApprovalStatus;

  @IsOptional()
  @IsEnum(ProductSortField)
  sortBy?: ProductSortField = ProductSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
