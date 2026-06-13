export const DiscountType = {
  PERCENT: 'percent',
  FIXED_AMOUNT: 'fixed_amount',
} as const;

export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];