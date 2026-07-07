import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { adminHeaders, customerHeaders } from '../../support/api-test-app';
import {
  adminOrderDetailFixture,
  adminOrderListFixture,
  adminOrderSummaryFixture,
  listOrdersQueryFixture,
  orderIds,
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

test.describe('Admin Order API', () => {
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

  test('GET /admin/orders returns the admin order list', async () => {
    orderService.getAdminOrderList.mockResolvedValue(adminOrderListFixture);

    const response = await api.get('/api/admin/orders', {
      headers: adminHeaders,
      params: {
        ...listOrdersQueryFixture,
        search: 'customer@example.com',
        fromDate: '2026-06-01',
        toDate: '2026-06-30',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expectPaginationMeta(body);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: adminOrderSummaryFixture.id,
        orderNumber: adminOrderSummaryFixture.orderNumber,
        customer: expect.objectContaining({
          email: 'customer@example.com',
        }),
        itemCount: 2,
      }),
    ]);
    expect(orderService.getAdminOrderList.calls).toEqual([
      [
        expect.objectContaining({
          ...listOrdersQueryFixture,
          search: 'customer@example.com',
          fromDate: '2026-06-01',
          toDate: '2026-06-30',
        }),
      ],
    ]);
  });

  test('GET /admin/orders/{orderId} returns admin order detail', async () => {
    orderService.getAdminOrderDetail.mockResolvedValue({
      data: adminOrderDetailFixture,
    });

    const response = await api.get(`/api/admin/orders/${orderIds.pending}`, {
      headers: adminHeaders,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: orderIds.pending,
        orderNumber: adminOrderDetailFixture.orderNumber,
        user: expect.objectContaining({
          email: 'customer@example.com',
        }),
        items: [
          expect.objectContaining({
            productNameSnapshot: 'Wireless Keyboard',
            skuSnapshot: 'KEYBOARD-001',
          }),
        ],
      }),
    );
    expect(orderService.getAdminOrderDetail.calls).toEqual([
      [orderIds.pending],
    ]);
  });

  test('PATCH /admin/orders/{orderId}/status updates order status as admin', async () => {
    orderService.adminUpdateStatus.mockResolvedValue({
      data: {
        ...orderSummaryFixture,
        status: 'PROCESSING',
      },
    });

    const response = await api.patch(
      `/api/admin/orders/${orderIds.pending}/status`,
      {
        headers: adminHeaders,
        data: {
          status: 'PROCESSING',
          note: 'Approved',
        },
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: orderIds.pending,
        status: 'PROCESSING',
      }),
    );
    expect(orderService.adminUpdateStatus.calls).toEqual([
      [
        orderIds.pending,
        expect.objectContaining({
          status: 'PROCESSING',
          note: 'Approved',
        }),
        'admin-id',
      ],
    ]);
  });

  for (const endpoint of [
    { method: 'get', path: '/api/admin/orders' },
    { method: 'get', path: `/api/admin/orders/${orderIds.pending}` },
    {
      method: 'patch',
      path: `/api/admin/orders/${orderIds.pending}/status`,
      data: { status: 'PROCESSING' },
    },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
      expect(getOrderServiceCallCount(orderService)).toBe(0);
    });

    test(`customer cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        headers: customerHeaders,
        data: endpoint.data,
      });

      expect(response.status()).toBe(403);
      expect(getOrderServiceCallCount(orderService)).toBe(0);
    });
  }

  for (const invalidPayload of [
    { status: 'UNKNOWN' },
    { status: 'PROCESSING', note: 123 },
    { status: 'PROCESSING', unknown: true },
  ]) {
    test(`PATCH /admin/orders/{orderId}/status rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.patch(
        `/api/admin/orders/${orderIds.pending}/status`,
        {
          headers: adminHeaders,
          data: invalidPayload,
        },
      );

      expect(response.status()).toBe(400);
      expect(orderService.adminUpdateStatus.calls).toEqual([]);
    });
  }
});
