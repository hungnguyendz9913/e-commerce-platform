export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELED: 'CANCELED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const OrderSortField = {
  CREATED_AT: 'CREATED_AT',
  UPDATED_AT: 'UPDATED_AT',
  ORDER_NUMBER: 'ORDER_NUMBER',
  TOTAL_AMOUNT: 'TOTAL_AMOUNT',
  STATUS: 'STATUS',
  PAYMENT_STATUS: 'PAYMENT_STATUS',
} as const;

export type OrderSortField =
  (typeof OrderSortField)[keyof typeof OrderSortField];

export const SortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];