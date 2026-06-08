export const Roles = {
  CUSTOMER: 'customer',
  MERCHANT: 'merchant',
  ADMIN: 'admin'
} as const;

export type RoleName = (typeof Roles)[keyof typeof Roles];