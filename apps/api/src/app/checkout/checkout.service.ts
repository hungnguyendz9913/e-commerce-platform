import { Injectable } from '@nestjs/common';
import { TransactionService } from '@e-commerce-platform/database';
import {
  ApplyVoucherDto,
  CheckoutDto,
} from '@e-commerce-platform/api-contracts';
import { CheckoutRepository } from './checkout.repository';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutCartValidator } from './checkout-cart.validator';
import { CheckoutTotalsService } from './checkout-totals.service';
import { CheckoutOrderFactory } from './checkout-order.factory';
import { CheckoutPaymentFactory } from './checkout-payment.factory';
import { VoucherService } from '../vouchers/voucher.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly transactionService: TransactionService,
    private readonly inventoryService: InventoryService,
    private readonly checkoutCartValidator: CheckoutCartValidator,
    private readonly checkoutTotalsService: CheckoutTotalsService,
    private readonly checkoutOrderFactory: CheckoutOrderFactory,
    private readonly checkoutPaymentFactory: CheckoutPaymentFactory,
    private readonly voucherService: VoucherService,
  ) {}

  async validateCheckout(userId: string, dto: CheckoutDto) {
    const cart = await this.checkoutRepository.findActiveCartWithItems(userId);
    this.checkoutCartValidator.assertCartNotEmpty(cart);
    this.checkoutCartValidator.assertCartItemsValid(cart.items);
    return this.checkoutTotalsService.buildCheckoutSummary(
      userId,
      cart.items,
      dto.voucherCode,
    );
  }

  async applyVoucher(userId: string, dto: ApplyVoucherDto) {
    const cart = await this.checkoutRepository.findActiveCartWithItems(userId);
    this.checkoutCartValidator.assertCartNotEmpty(cart);
    this.checkoutCartValidator.assertCartItemsValid(cart.items);
    const summary = await this.checkoutTotalsService.buildCheckoutSummary(
      userId,
      cart.items,
      dto.voucherCode,
    );

    return {
      voucherCode: summary.voucher?.voucherCode ?? dto.voucherCode,
      subtotal: summary.subtotal,
      discount: summary.discount,
      shippingFee: summary.shippingFee,
      total: summary.total,
    };
  }

  async createOrderFromCart(userId: string, dto: CheckoutDto) {
    return this.transactionService.run(async (tx) => {
      const cart = await this.checkoutRepository.findActiveCartWithItems(
        userId,
        tx,
      );
      this.checkoutCartValidator.assertCartNotEmpty(cart);
      this.checkoutCartValidator.assertCartItemsValid(cart.items);

      const summary = await this.checkoutTotalsService.buildCheckoutSummary(
        userId,
        cart.items,
        dto.voucherCode,
        tx,
      );

      const orderNumber = this.generateOrderNumber();

      const order = await this.checkoutRepository.createOrder(
        this.checkoutOrderFactory.buildOrderData({
          userId,
          dto,
          summary,
          orderNumber,
        }),
        tx,
      );

      const orderItems = this.checkoutOrderFactory.buildOrderItems(
        cart.items,
        order.id,
      );

      await this.checkoutRepository.createOrderItems(orderItems, tx);

      for (const item of cart.items) {
        await this.inventoryService.deductStockForCheckout(
          item.productId,
          item.quantity,
          order.id,
          tx,
        );
      }

      if (summary.voucher) {
        await this.voucherService.createVoucherRedemption({
          userId,
          orderId: order.id,
          voucherId: summary.voucher.voucherId,
          discountAmount: summary.discount,
          client: tx,
        });
      }

      const paymentData = this.checkoutPaymentFactory.buildPaymentData(
        dto.paymentProvider,
        order.id,
        summary.total,
      );

      const payment = paymentData
        ? await this.checkoutRepository.createPayment(paymentData, tx)
        : undefined;

      await this.checkoutRepository.markCartCheckedOut(cart.id, tx);

      if (!payment) {
        return { order };
      }

      return {
        order,
        payment,
        paymentUrl: this.checkoutPaymentFactory.buildPaymentUrl(
          dto.paymentProvider,
          order.id,
        ),
      };
    });
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
  }
}
