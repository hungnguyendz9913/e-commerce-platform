export const Roles = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
} as const;

export type RoleName = (typeof Roles)[keyof typeof Roles];
