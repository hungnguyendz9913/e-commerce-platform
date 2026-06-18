import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  IsArray,
  IsUUID,
  IsPositive,
  ValidateIf,
  ArrayNotEmpty,
} from 'class-validator';
import { DiscountType, VoucherScope, VoucherStatus } from './voucher.enums.js';
import { normalizeRequiredString } from '../common/validators.js';
import { IsAfter } from '../common/is-after.js';

export class CreateVoucherDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  code!: string;

  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(1000000000)
  discountValue!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumOrderAmount?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maximumDiscountAmount?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  @IsAfter('startsAt', {
    message: 'expiresAt must be after startsAt',
  })
  expiresAt?: Date;

  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @IsOptional()
  @IsEnum(VoucherScope)
  scope?: VoucherScope;

  @ValidateIf((dto) => dto.scope === VoucherScope.PRODUCT || dto.productIds !== undefined)
  @IsArray()
  @ArrayNotEmpty({ message: 'Product IDs are required when scope is "product"' })
  @IsUUID('4', { each: true })
  productIds?: string[];

  @ValidateIf((dto) => dto.scope === VoucherScope.CATEGORY || dto.categoryIds !== undefined)
  @IsArray()
  @ArrayNotEmpty({ message: 'Category IDs are required when scope is "category"' })
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
