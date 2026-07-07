import { OrderStatus } from '@e-commerce-platform/types';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminUpdateStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
