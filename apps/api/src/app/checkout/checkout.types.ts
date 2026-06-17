import { CheckoutDto } from '@e-commerce-platform/api-contracts';
import { Prisma } from '@e-commerce-platform/database';
import { CheckoutRepository } from './checkout.repository';
import { ValidatedVoucherForCheckout } from '../vouchers/voucher-checkout.types';

export const SHIPPING_FEE = 30000;

export type CartWithItems = NonNullable<
  Awaited<ReturnType<CheckoutRepository['findActiveCartWithItems']>>
>;

export type CartItem = CartWithItems['items'][number];

export type CheckoutSummary = {
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucher?: ValidatedVoucherForCheckout;
};

export type BuildOrderDataParams = {
  userId: string;
  dto: CheckoutDto;
  summary: CheckoutSummary;
  orderNumber: string;
};

export type OrderCreateData = Prisma.OrderCreateArgs['data'];
