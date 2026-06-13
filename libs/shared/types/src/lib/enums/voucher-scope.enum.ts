export const VoucherScope = {
  ORDER: 'order',
  PRODUCT: 'product',
  CATEGORY: 'category',
} as const;

export type VoucherScope = (typeof VoucherScope)[keyof typeof VoucherScope];