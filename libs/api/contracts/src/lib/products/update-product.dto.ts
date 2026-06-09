import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductApprovalStatus, ProductStatus } from './product.enums.js';
import { ProductImageDto } from './product-image.dto.js';
import { ProductInventoryDto } from './product-inventory.dto.js';
import {
  normalizeLowerString,
  normalizeOptionalString,
  normalizeRequiredString,
} from './validators.js';

export class UpdateProductDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sku?: string;

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

  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsEnum(ProductApprovalStatus)
  approvalStatus?: ProductApprovalStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductInventoryDto)
  inventory?: ProductInventoryDto;
}
