import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  adminHeaders,
  customerHeaders,
} from '../../support/api-test-app';
import {
  canceledOrderFixture,
  cancelOrderPayloadFixture,
  listOrdersQueryFixture,
  orderDetailFixture,
  orderIds,
  orderListFixture,
  orderSummaryFixture,
} from './fixtures';
import {
  closeOrderApiTestApp,
  createOrderApiTestApp,
  createOrderServiceMock,
  expectDataEnvelope,
  expectPaginationMeta,
  getOrderServiceCallCount,
  resetOrderServiceMock,
  type OrderServiceMock,
} from './helpers';

test.describe('Order API', () => {
  let app: INestApplication;
  let api: APIRequestContext;
  let orderService: OrderServiceMock;

  test.beforeAll(async () => {
    orderService = createOrderServiceMock();
    ({ app, api } = await createOrderApiTestApp(orderService));
  });

  test.beforeEach(() => {
    resetOrderServiceMock(orderService);
  });

  test.afterAll(async () => {
    await closeOrderApiTestApp(app, api);
  });

  test('GET /orders returns the authenticated customer order list', async () => {
    orderService.getMyOrderList.mockResolvedValue(orderListFixture);

    const response = await api.get('/api/orders', {
      headers: customerHeaders,
      params: listOrdersQueryFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expectPaginationMeta(body);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: orderSummaryFixture.id,
        orderNumber: orderSummaryFixture.orderNumber,
        status: orderSummaryFixture.status,
        paymentStatus: orderSummaryFixture.paymentStatus,
        totalAmount: orderSummaryFixture.totalAmount,
      }),
    ]);
    expect(orderService.getMyOrderList.calls).toEqual([
      [
        'customer-id',
        expect.objectContaining({
          ...listOrdersQueryFixture,
          page: 1,
          limit: 10,
        }),
      ],
    ]);
  });

  test('GET /orders/{orderId} returns the authenticated customer order detail', async () => {
    orderService.getMyOrderDetail.mockResolvedValue({
      data: orderDetailFixture,
    });

    const response = await api.get(`/api/orders/${orderIds.pending}`, {
      headers: customerHeaders,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: orderIds.pending,
        orderNumber: orderDetailFixture.orderNumber,
        recipientName: orderDetailFixture.recipientName,
        recipientPhone: orderDetailFixture.recipientPhone,
        shippingAddress: orderDetailFixture.shippingAddress,
        subtotalAmount: orderDetailFixture.subtotalAmount,
        totalAmount: orderDetailFixture.totalAmount,
        status: orderDetailFixture.status,
        paymentStatus: orderDetailFixture.paymentStatus,
      }),
    );
    expect(body.data.items).toEqual([
      expect.objectContaining({
        id: orderIds.item,
        productNameSnapshot: 'Wireless Keyboard',
        quantity: 2,
        totalPrice: 700000,
      }),
    ]);
    expect(orderService.getMyOrderDetail.calls).toEqual([
      ['customer-id', orderIds.pending],
    ]);
  });

  test('POST /orders/{orderId}/cancel cancels an authenticated customer order', async () => {
    orderService.cancelMyOrder.mockResolvedValue({
      data: canceledOrderFixture,
    });

    const response = await api.post(`/api/orders/${orderIds.pending}/cancel`, {
      headers: customerHeaders,
      data: cancelOrderPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: orderIds.pending,
        status: 'CANCELED',
        orderNumber: canceledOrderFixture.orderNumber,
      }),
    );
    expect(orderService.cancelMyOrder.calls).toEqual([
      [
        'customer-id',
        orderIds.pending,
        expect.objectContaining(cancelOrderPayloadFixture),
      ],
    ]);
  });

  for (const endpoint of [
    { method: 'get', path: '/api/orders' },
    { method: 'get', path: `/api/orders/${orderIds.pending}` },
    {
      method: 'post',
      path: `/api/orders/${orderIds.pending}/cancel`,
      data: cancelOrderPayloadFixture,
    },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
      expect(getOrderServiceCallCount(orderService)).toBe(0);
    });

    test(`non-customer cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        headers: adminHeaders,
        data: endpoint.data,
      });

      expect(response.status()).toBe(403);
      expect(getOrderServiceCallCount(orderService)).toBe(0);
    });
  }

  for (const invalidQuery of [
    { page: '0' },
    { limit: '101' },
    { status: 'UNKNOWN' },
    { paymentStatus: 'UNKNOWN' },
    { from: 'not-a-date' },
    { to: 'not-a-date' },
    { sortBy: 'UNKNOWN' },
    { sortOrder: 'SIDEWAYS' },
  ]) {
    test(`GET /orders rejects invalid query ${JSON.stringify(invalidQuery)}`, async () => {
      const response = await api.get('/api/orders', {
        headers: customerHeaders,
        params: invalidQuery,
      });

      expect(response.status()).toBe(400);
      expect(getOrderServiceCallCount(orderService)).toBe(0);
    });
  }

  for (const invalidPayload of [
    { reason: 123 },
    { reason: 'x'.repeat(501) },
    { ...cancelOrderPayloadFixture, unknown: true },
  ]) {
    test(`POST /orders/{orderId}/cancel rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.post(`/api/orders/${orderIds.pending}/cancel`, {
        headers: customerHeaders,
        data: invalidPayload,
      });

      expect(response.status()).toBe(400);
      expect(orderService.cancelMyOrder.calls).toEqual([]);
    });
  }
});
