export const VoucherScope = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
} as const;

export type VoucherScope = (typeof VoucherScope)[keyof typeof VoucherScope];