import { DbClient } from '@e-commerce-platform/database';

export type VoucherCheckoutCartItem = {
  productId: string;
  categoryId?: string | null;
  quantity: number;
  unitPrice: number;
};

export type ValidateVoucherForCheckoutParams = {
  userId: string;
  voucherCode: string;
  subtotal: number;
  cartItems: VoucherCheckoutCartItem[];
  client?: DbClient;
};

export type ValidatedVoucherForCheckout = {
  voucherId: string;
  voucherCode: string;
  eligibleAmount: number;
  discount: number;
};

export type CreateVoucherRedemptionParams = {
  userId: string;
  orderId: string;
  voucherId: string;
  discountAmount: number;
  client?: DbClient;
};
