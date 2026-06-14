export const VoucherStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];