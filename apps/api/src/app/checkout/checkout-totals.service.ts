import { Injectable } from '@nestjs/common';
import { DbClient } from '@e-commerce-platform/database';
import { VoucherService } from '../vouchers/voucher.service';
import { CartItem, CheckoutSummary, SHIPPING_FEE } from './checkout.types';

@Injectable()
export class CheckoutTotalsService {
  constructor(private readonly voucherService: VoucherService) {}

  async buildCheckoutSummary(
    userId: string,
    items: CartItem[],
    voucherCode?: string,
    client?: DbClient,
  ): Promise<CheckoutSummary> {
    const subtotal = this.calcSubtotal(items);
    const voucher = voucherCode
      ? await this.voucherService.validateVoucherForCheckout({
          userId,
          voucherCode,
          subtotal,
          cartItems: this.toVoucherCartItems(items),
          client,
        })
      : undefined;
    const discount = voucher?.discount ?? 0;
    const total = subtotal - discount + SHIPPING_FEE;

    return {
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPriceSnapshot),
        totalPrice: Number(item.unitPriceSnapshot) * item.quantity,
      })),
      subtotal,
      discount,
      shippingFee: SHIPPING_FEE,
      total,
      voucher,
    };
  }

  private calcSubtotal(items: CartItem[]): number {
    return items.reduce(
      (sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity,
      0,
    );
  }

  private toVoucherCartItems(items: CartItem[]) {
    return items.map((item) => ({
      productId: item.productId,
      categoryId: item.product.categoryId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPriceSnapshot),
    }));
  }
}
