export const orderIds = {
  pending: '11111111-aaaa-4111-8111-111111111111',
  shipped: '22222222-aaaa-4222-8222-222222222222',
  item: '33333333-aaaa-4333-8333-333333333333',
};

export const productIds = {
  keyboard: '44444444-aaaa-4444-8444-444444444444',
};

export const listOrdersQueryFixture = {
  page: 1,
  limit: 10,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  sortBy: 'CREATED_AT',
  sortOrder: 'DESC',
};

export const orderSummaryFixture = {
  id: orderIds.pending,
  orderNumber: 'ORD-20260614-0001',
  status: 'PENDING',
  paymentStatus: 'PENDING',
  subtotalAmount: 700000,
  discountAmount: 0,
  shippingFee: 30000,
  taxAmount: 0,
  totalAmount: 730000,
  createdAt: '2026-06-14T08:00:00.000Z',
  updatedAt: '2026-06-14T08:00:00.000Z',
};

export const orderListFixture = {
  data: [orderSummaryFixture],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

export const orderDetailFixture = {
  ...orderSummaryFixture,
  recipientName: 'Nguyen Van A',
  recipientPhone: '+84901234567',
  shippingAddress: '1 Nguyen Trai, District 1, Ho Chi Minh City, Vietnam',
  items: [
    {
      id: orderIds.item,
      productId: productIds.keyboard,
      productNameSnapshot: 'Wireless Keyboard',
      skuSnapshot: 'KEYBOARD-001',
      unitPriceSnapshot: 350000,
      quantity: 2,
      totalPrice: 700000,
    },
  ],
};

export const cancelOrderPayloadFixture = {
  reason: 'Customer changed their mind',
};

export const canceledOrderFixture = {
  ...orderSummaryFixture,
  status: 'CANCELED',
  updatedAt: '2026-06-14T08:10:00.000Z',
};

export const adminOrderSummaryFixture = {
  id: orderIds.pending,
  orderNumber: orderSummaryFixture.orderNumber,
  customer: {
    id: 'customer-id',
    email: 'customer@example.com',
    fullName: 'Nguyen Van A',
    phone: '+84901234567',
  },
  status: 'PENDING',
  paymentStatus: 'PENDING',
  totalAmount: 730000,
  itemCount: 2,
  createdAt: '2026-06-14T08:00:00.000Z',
  updatedAt: '2026-06-14T08:00:00.000Z',
};

export const adminOrderListFixture = {
  data: [adminOrderSummaryFixture],
  meta: {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
  },
};

export const adminOrderDetailFixture = {
  ...orderDetailFixture,
  user: adminOrderSummaryFixture.customer,
  voucher: null,
  voucherRedemption: null,
  payments: [
    {
      id: '55555555-aaaa-4555-8555-555555555555',
      provider: 'COD',
      method: 'COD',
      status: 'PENDING',
      amount: 730000,
      currency: 'VND',
      createdAt: '2026-06-14T08:00:00.000Z',
      updatedAt: '2026-06-14T08:00:00.000Z',
    },
  ],
  statusHistories: [],
};
