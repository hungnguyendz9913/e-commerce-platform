export type CommerceApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  code?: string;
};

export class CommerceApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: CommerceApiErrorBody,
  ) {
    super(message);
    this.name = "CommerceApiError";
  }
}

export type CartProductView = {
  id: string;
  name: string;
  sku?: string;
  imageUrl?: string;
  categoryName?: string;
  stockQuantity?: number;
};

export type CartItemView = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: CartProductView;
};

export type CartTotalsView = {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
};

export type CartView = {
  id: string | null;
  items: CartItemView[];
  totals: CartTotalsView;
  isEmpty: boolean;
};

export type DeliveryForm = {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  country: string;
};

export type DeliveryInfoPayload = {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
};

export type CheckoutPaymentProvider = "COD" | "MOMO" | "VNPAY";

export const CHECKOUT_PAYMENT_PROVIDERS = ["COD", "MOMO", "VNPAY"] as const;

export type CheckoutSummary = {
  items: Array<{
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
};

export type CheckoutPayload = {
  deliveryInfo: DeliveryInfoPayload;
  paymentProvider: CheckoutPaymentProvider;
  voucherCode?: string;
};

export type CheckoutResult = {
  orderId?: string;
  orderNumber?: string;
  paymentProvider: CheckoutPaymentProvider;
  paymentId?: string;
  paymentStatus?: string;
  paymentUrl?: string;
  raw: unknown;
};

export type PaymentResultStatus = "success" | "failed" | "canceled" | "pending";

export type PaymentResultView = {
  status: PaymentResultStatus;
  title: string;
  message: string;
  orderReference?: string;
  paymentProvider?: string;
  retryHref: string;
};
