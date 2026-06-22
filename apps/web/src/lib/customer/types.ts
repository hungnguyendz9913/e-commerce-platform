export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  status?: string;
};

export type CustomerProfilePayload = {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
};

export type CustomerAddress = {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
  isDefault: boolean;
};

export type CustomerAddressPayload = {
  recipientName: string;
  phone: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  country: string;
  isDefault?: boolean;
};

export const CUSTOMER_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
] as const;

export type CustomerOrderStatus = (typeof CUSTOMER_ORDER_STATUSES)[number];

export const CUSTOMER_PAYMENT_STATUSES = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "REFUNDED",
] as const;

export type CustomerPaymentStatus = (typeof CUSTOMER_PAYMENT_STATUSES)[number];

export type CustomerOrderItem = {
  id: string;
  productId?: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus | string;
  paymentStatus: CustomerPaymentStatus | string;
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  itemSummary?: string;
};

export type CustomerOrderDetail = CustomerOrderSummary & {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  items: CustomerOrderItem[];
};

export type CustomerOrderList = {
  orders: CustomerOrderSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CustomerOrderListQuery = {
  status?: CustomerOrderStatus | "all";
  page?: number;
  limit?: number;
};

export type CancelCustomerOrderPayload = {
  reason?: string;
};

export type CustomerMutationSupport = {
  canUpdateAddress: boolean;
  canDeleteAddress: boolean;
  canSetDefaultAddress: boolean;
};

