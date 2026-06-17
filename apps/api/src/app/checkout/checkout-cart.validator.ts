import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CartItem, CartWithItems } from './checkout.types';

@Injectable()
export class CheckoutCartValidator {
  assertCartNotEmpty(
    cart: CartWithItems | null,
  ): asserts cart is CartWithItems {
    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Cart is empty or no active cart found.',
      });
    }
  }

  assertCartItemsValid(items: CartItem[]) {
    for (const item of items) {
      const product = item.product;

      if (
        product.status !== 'ACTIVE' ||
        product.approvalStatus !== 'APPROVED'
      ) {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Product "${product.name}" is no longer available.`,
        });
      }

      if (!product.inventoryItem) {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Inventory not found for product "${product.name}".`,
        });
      }

      const available =
        product.inventoryItem.stockQuantity -
        product.inventoryItem.reservedQuantity;

      if (available < item.quantity) {
        throw new UnprocessableEntityException({
          code: 'BUSINESS_RULE_VIOLATION',
          message: `Insufficient stock for product "${product.name}". Available: ${available}, requested: ${item.quantity}.`,
        });
      }
    }
  }
}
