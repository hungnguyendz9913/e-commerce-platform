import { IsInt, IsOptional, Min, Validate } from 'class-validator';
import { ReservedQuantityWithinStockConstraint } from './validators';

export class ProductInventoryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Validate(ReservedQuantityWithinStockConstraint)
  reservedQuantity?: number;
}
