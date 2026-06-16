import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { DeliveryInfoDto } from './delivery-info.dto.js';

// Using PaymentProvider to identify COD vs MOMO vs VNPAY checkout paths
export enum CheckoutPaymentProvider {
  COD = 'COD',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
}

export class CheckoutDto {
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo!: DeliveryInfoDto;

  @IsEnum(CheckoutPaymentProvider)
  paymentProvider!: CheckoutPaymentProvider;

  @IsOptional()
  @IsString()
  voucherCode?: string;
}