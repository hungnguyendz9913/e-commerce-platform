export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ProductApprovalStatus =
  (typeof ProductApprovalStatus)[keyof typeof ProductApprovalStatus];

export const ProductSortField = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  NAME: 'name',
  PRICE: 'price',
  SKU: 'sku',
  STATUS: 'status',
  APPROVAL_STATUS: 'approvalStatus',
} as const;

export type ProductSortField =
  (typeof ProductSortField)[keyof typeof ProductSortField];

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
