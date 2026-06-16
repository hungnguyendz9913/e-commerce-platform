import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeliveryInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  recipientName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  recipientPhone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  shippingAddress!: string;
}