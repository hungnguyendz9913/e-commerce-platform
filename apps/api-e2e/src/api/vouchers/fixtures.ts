export const voucherIds = {
  active: '11111111-1111-4111-8111-111111111111',
  inactive: '22222222-2222-4222-8222-222222222222',
};

export const productIds = {
  keyboard: '33333333-3333-4333-8333-333333333333',
};

export const categoryIds = {
  accessories: '44444444-4444-4444-8444-444444444444',
};

export const activeVoucherFixture = {
  id: voucherIds.active,
  code: 'SALE10',
  discountType: 'PERCENT',
  discountValue: 10,
  minimumOrderAmount: 100000,
  maximumDiscountAmount: 50000,
  usageLimit: 100,
  perUserLimit: 1,
  startsAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2026-12-31T23:59:59.000Z',
  status: 'ACTIVE',
  scope: 'PRODUCT',
};

export const inactiveVoucherFixture = {
  ...activeVoucherFixture,
  id: voucherIds.inactive,
  status: 'INACTIVE',
};

export const createVoucherPayloadFixture = {
  code: 'SUMMER25',
  discountType: 'PERCENT',
  discountValue: 25,
  minimumOrderAmount: 200000,
  maximumDiscountAmount: 100000,
  usageLimit: 200,
  perUserLimit: 1,
  startsAt: '2026-06-01T00:00:00.000Z',
  expiresAt: '2026-07-01T00:00:00.000Z',
  status: 'ACTIVE',
  scope: 'ORDER',
};

export const createdVoucherFixture = {
  ...activeVoucherFixture,
  id: '55555555-5555-4555-8555-555555555555',
  code: createVoucherPayloadFixture.code,
  discountType: createVoucherPayloadFixture.discountType,
  discountValue: createVoucherPayloadFixture.discountValue,
  minimumOrderAmount: createVoucherPayloadFixture.minimumOrderAmount,
  maximumDiscountAmount: createVoucherPayloadFixture.maximumDiscountAmount,
  usageLimit: createVoucherPayloadFixture.usageLimit,
  startsAt: createVoucherPayloadFixture.startsAt,
  expiresAt: createVoucherPayloadFixture.expiresAt,
  scope: createVoucherPayloadFixture.scope,
};

export const updateVoucherPayloadFixture = {
  discountValue: 15,
  maximumDiscountAmount: 75000,
  expiresAt: '2026-08-01T00:00:00.000Z',
};

export const updatedVoucherFixture = {
  ...activeVoucherFixture,
  discountValue: updateVoucherPayloadFixture.discountValue,
  maximumDiscountAmount: updateVoucherPayloadFixture.maximumDiscountAmount,
  expiresAt: updateVoucherPayloadFixture.expiresAt,
};

export const voucherQueryFixture = {
  q: 'sale',
  status: 'ACTIVE',
  scope: 'PRODUCT',
  page: 1,
  limit: 20,
  sortBy: 'CREATED_AT',
  sortOrder: 'DESC',
};

export const paginationMetaFixture = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
};

export const deactivateVoucherFixture = {
  ...inactiveVoucherFixture,
  id: voucherIds.active,
};
