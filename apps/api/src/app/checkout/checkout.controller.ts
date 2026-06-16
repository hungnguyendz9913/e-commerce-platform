import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import {
  type AuthenticatedUser,
  CurrentUser,
  Roles,
  RolesGuard,
} from '@e-commerce-platform/api-common';
import {
  ApplyVoucherDto,
  CheckoutDto,
} from '@e-commerce-platform/api-contracts';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleValues.CUSTOMER)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('validate')
  validateCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    return this.checkoutService.validateCheckout(user.userId, dto);
  }

  @Post('voucher')
  applyVoucher(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ApplyVoucherDto,
  ) {
    return this.checkoutService.applyVoucher(user.userId, dto);
  }

  @Post()
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    return this.checkoutService.createOrderFromCart(user.userId, dto);
  }
}