export const DiscountType = {
  PERCENT: 'percent',
  FIXED_AMOUNT: 'fixed_amount',
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const VoucherScope = {
  ORDER: 'order',
  PRODUCT: 'product',
  CATEGORY: 'category',
} as const;

export type VoucherScope = (typeof VoucherScope)[keyof typeof VoucherScope];

export const VoucherStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];

export const VoucherSortField = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  CODE: 'code',
  STARTS_AT: 'startsAt',
  EXPIRES_AT: 'expiresAt',
} as const;

export type VoucherSortField =
  (typeof VoucherSortField)[keyof typeof VoucherSortField];

export const VoucherSortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type VoucherSortOrder =
  (typeof VoucherSortOrder)[keyof typeof VoucherSortOrder];
