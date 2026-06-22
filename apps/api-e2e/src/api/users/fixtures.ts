export const addressIds = {
  primary: '11111111-1111-4111-8111-111111111111',
  secondary: '22222222-2222-4222-8222-222222222222',
};

export const updateAddressPayloadFixture = {
  recipientName: 'Nguyen Van B',
  phone: '0912345678',
  addressLine: '123 Nguyen Trai',
  ward: 'Ben Thanh',
  district: 'District 1',
  city: 'Ho Chi Minh City',
  country: 'Vietnam',
  isDefault: false,
};

export const updatedAddressFixture = {
  id: addressIds.primary,
  userId: 'customer-id',
  ...updateAddressPayloadFixture,
  createdAt: '2026-06-22T09:00:00.000Z',
  updatedAt: '2026-06-22T10:00:00.000Z',
};

export const defaultAddressFixture = {
  ...updatedAddressFixture,
  id: addressIds.secondary,
  isDefault: true,
  updatedAt: '2026-06-22T11:00:00.000Z',
};

export const deletedAddressFixture = {
  ...updatedAddressFixture,
  deletedAt: '2026-06-22T12:00:00.000Z',
};
