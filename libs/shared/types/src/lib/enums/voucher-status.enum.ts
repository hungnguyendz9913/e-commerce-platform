export const VoucherStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];