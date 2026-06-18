import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  OrderSortField,
  OrderStatus,
  PaymentStatus,
  SortOrder,
} from '@e-commerce-platform/types';
import { normalizeOptionalString } from '../common/validators.js';

export class ListOrdersQueryDto {
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
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsDateString()
  from?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(OrderSortField)
  sortBy?: OrderSortField = OrderSortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
