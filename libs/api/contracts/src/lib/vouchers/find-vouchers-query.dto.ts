import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  VoucherScope,
  VoucherSortField,
  VoucherSortOrder,
  VoucherStatus,
} from './voucher.enums.js';

function normalizeOptionalString(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();

  return normalized.length > 0 ? normalized : undefined;
}

export class FindVouchersQueryDto {
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
  @MaxLength(64)
  q?: string;

  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @IsOptional()
  @IsEnum(VoucherScope)
  scope?: VoucherScope;

  @IsOptional()
  @IsEnum(VoucherSortField)
  sortBy?: VoucherSortField = VoucherSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(VoucherSortOrder)
  sortOrder?: VoucherSortOrder = VoucherSortOrder.DESC;
}
