import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { DeliveryInfoDto } from './delivery-info.dto.js';

export class ApplyVoucherDto {
  @IsString()
  @IsNotEmpty()
  voucherCode!: string;

  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  deliveryInfo!: DeliveryInfoDto;
}