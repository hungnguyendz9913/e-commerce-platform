export const DiscountType = {
  PERCENT: 'PERCENT',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const VoucherScope = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
} as const;

export type VoucherScope = (typeof VoucherScope)[keyof typeof VoucherScope];

export const VoucherStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];

export const VoucherSortField = {
  CREATED_AT: 'CREATED_AT',
  UPDATED_AT: 'UPDATED_AT',
  CODE: 'CODE',
  STARTS_AT: 'STARTS_AT',
  EXPIRES_AT: 'EXPIRES_AT',
} as const;

export type VoucherSortField =
  (typeof VoucherSortField)[keyof typeof VoucherSortField];

export const VoucherSortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

export type VoucherSortOrder =
  (typeof VoucherSortOrder)[keyof typeof VoucherSortOrder];
