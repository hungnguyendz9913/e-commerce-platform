import {
  ProductApprovalStatus,
  ProductStatus,
} from '@e-commerce-platform/api-contracts';

export const productIds = {
  visible: '11111111-1111-4111-8111-111111111111',
  hidden: '22222222-2222-4222-8222-222222222222',
  admin: '33333333-3333-4333-8333-333333333333',
};

export const categoryFixture = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  name: 'Accessories',
  slug: 'accessories',
  status: 'active',
};

export const primaryImageFixture = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  imageUrl: 'https://example.com/keyboard.png',
  altText: 'Wireless Keyboard',
  isPrimary: true,
  sortOrder: 1,
};

export const inventoryFixture = {
  stockQuantity: 20,
  reservedQuantity: 0,
};

export const publicProductSummaryFixture = {
  id: productIds.visible,
  name: 'Wireless Keyboard',
  slug: 'wireless-keyboard',
  price: 350000,
  category: {
    id: categoryFixture.id,
    name: categoryFixture.name,
  },
  thumbnailUrl: primaryImageFixture.imageUrl,
  inStock: true,
};

export const publicProductDetailFixture = {
  ...publicProductSummaryFixture,
  sku: 'KB-001',
  description: 'Compact wireless keyboard.',
  images: [primaryImageFixture],
  stockQuantity: inventoryFixture.stockQuantity,
};

export const adminProductSummaryFixture = {
  id: productIds.admin,
  sku: 'KB-001',
  name: 'Wireless Keyboard',
  slug: 'wireless-keyboard',
  price: 350000,
  status: 'active',
  approvalStatus: 'approved',
  category: categoryFixture,
  primaryImage: primaryImageFixture,
  stockQuantity: inventoryFixture.stockQuantity,
  reservedQuantity: inventoryFixture.reservedQuantity,
  createdAt: '2026-06-08T10:00:00.000Z',
  updatedAt: '2026-06-08T10:00:00.000Z',
};

export const adminProductDetailFixture = {
  ...adminProductSummaryFixture,
  description: 'Compact wireless keyboard.',
  images: [primaryImageFixture],
};

export const createProductPayloadFixture = {
  categoryId: categoryFixture.id,
  sku: 'KB-001',
  name: 'Wireless Keyboard',
  slug: 'wireless-keyboard',
  description: 'Compact wireless keyboard.',
  price: 350000,
  status: ProductStatus.ACTIVE,
  approvalStatus: ProductApprovalStatus.APPROVED,
  images: [
    {
      imageUrl: primaryImageFixture.imageUrl,
      altText: primaryImageFixture.altText,
      isPrimary: true,
      sortOrder: 1,
    },
  ],
  inventory: {
    stockQuantity: inventoryFixture.stockQuantity,
    reservedQuantity: inventoryFixture.reservedQuantity,
  },
};

export const updateProductPayloadFixture = {
  name: 'Wireless Keyboard Pro',
  description: 'Updated description.',
  price: 420000,
  status: ProductStatus.ACTIVE,
};

export const updatedAdminProductDetailFixture = {
  ...adminProductDetailFixture,
  ...updateProductPayloadFixture,
  status: 'active',
  updatedAt: '2026-06-09T10:00:00.000Z',
};

export const paginationMetaFixture = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};
