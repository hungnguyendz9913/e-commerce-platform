import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CheckoutRepository } from './checkout.repository';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { VoucherModule } from '../vouchers/voucher.module';
import { CheckoutCartValidator } from './checkout-cart.validator';
import { CheckoutTotalsService } from './checkout-totals.service';
import { CheckoutOrderFactory } from './checkout-order.factory';
import { CheckoutPaymentFactory } from './checkout-payment.factory';

@Module({
  imports: [AuthModule, InventoryModule, VoucherModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    CheckoutRepository,
    CheckoutCartValidator,
    CheckoutTotalsService,
    CheckoutOrderFactory,
    CheckoutPaymentFactory,
  ],
})
export class CheckoutModule {}
