import { Injectable } from '@nestjs/common';
import {
  CartItem,
  BuildOrderDataParams,
  OrderCreateData,
} from './checkout.types';

@Injectable()
export class CheckoutOrderFactory {
  buildOrderData({
    userId,
    dto,
    summary,
    orderNumber,
  }: BuildOrderDataParams): OrderCreateData {
    return {
      user: { connect: { id: userId } },
      voucher: summary.voucher
        ? { connect: { id: summary.voucher.voucherId } }
        : undefined,
      orderNumber,
      subtotalAmount: summary.subtotal,
      discountAmount: summary.discount,
      shippingFee: summary.shippingFee,
      taxAmount: 0,
      totalAmount: summary.total,
      recipientName: dto.deliveryInfo.recipientName,
      recipientPhone: dto.deliveryInfo.recipientPhone,
      shippingAddress: dto.deliveryInfo.shippingAddress,
    };
  }

  buildOrderItems(items: CartItem[], orderId: string) {
    return items.map((item) => ({
      orderId,
      productId: item.productId,
      productNameSnapshot: item.product.name,
      skuSnapshot: item.product.sku,
      unitPriceSnapshot: item.product.price,
      quantity: item.quantity,
      totalPrice: Number(item.product.price) * item.quantity,
    }));
  }
}
