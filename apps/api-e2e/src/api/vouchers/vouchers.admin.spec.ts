import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  adminHeaders,
  customerHeaders,
} from '../../support/api-test-app';
import {
  activeVoucherFixture,
  createVoucherPayloadFixture,
  createdVoucherFixture,
  deactivateVoucherFixture,
  paginationMetaFixture,
  updatedVoucherFixture,
  updateVoucherPayloadFixture,
  voucherIds,
  voucherQueryFixture,
} from './fixtures';
import {
  closeVoucherApiTestApp,
  createVoucherApiTestApp,
  createVoucherServiceMock,
  expectDataEnvelope,
  expectPaginationMeta,
  getVoucherServiceCallCount,
  resetVoucherServiceMock,
  type VoucherServiceMock,
} from './helpers';

test.describe('Admin vouchers API', () => {
  let app: INestApplication;
  let api: APIRequestContext;
  let voucherService: VoucherServiceMock;

  test.beforeAll(async () => {
    voucherService = createVoucherServiceMock();
    ({ app, api } = await createVoucherApiTestApp(voucherService));
  });

  test.beforeEach(() => {
    resetVoucherServiceMock(voucherService);
  });

  test.afterAll(async () => {
    await closeVoucherApiTestApp(app, api);
  });

  test('POST /admin/vouchers creates a voucher from the submitted payload', async () => {
    voucherService.createVoucher.mockResolvedValue({
      data: createdVoucherFixture,
    });

    const response = await api.post('/api/admin/vouchers', {
      headers: adminHeaders,
      data: createVoucherPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: createdVoucherFixture.id,
        code: createVoucherPayloadFixture.code,
        discountType: createVoucherPayloadFixture.discountType,
        discountValue: createVoucherPayloadFixture.discountValue,
        scope: createVoucherPayloadFixture.scope,
      }),
    );
    expect(voucherService.createVoucher.calls[0][0]).toEqual(
      expect.objectContaining({
        code: createVoucherPayloadFixture.code,
        discountType: createVoucherPayloadFixture.discountType,
        discountValue: createVoucherPayloadFixture.discountValue,
      }),
    );
  });

  test('GET /admin/vouchers returns vouchers with filters and pagination metadata', async () => {
    voucherService.findAllVouchers.mockResolvedValue({
      data: [activeVoucherFixture],
      meta: paginationMetaFixture,
    });

    const response = await api.get('/api/admin/vouchers', {
      headers: adminHeaders,
      params: voucherQueryFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expectPaginationMeta(body);
    expect(body.data).toEqual([activeVoucherFixture]);
    expect(voucherService.findAllVouchers.calls[0][0]).toEqual(
      expect.objectContaining(voucherQueryFixture),
    );
  });

  test('GET /admin/vouchers/{voucherId} returns voucher detail', async () => {
    voucherService.findVoucherById.mockResolvedValue({
      data: activeVoucherFixture,
    });

    const response = await api.get(
      `/api/admin/vouchers/${voucherIds.active}`,
      {
        headers: adminHeaders,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: voucherIds.active,
        code: activeVoucherFixture.code,
      }),
    );
    expect(voucherService.findVoucherById.calls).toEqual([
      [voucherIds.active],
    ]);
  });

  test('PATCH /admin/vouchers/{voucherId} updates submitted voucher fields', async () => {
    voucherService.updateVoucherBeforeStart.mockResolvedValue({
      data: updatedVoucherFixture,
    });

    const response = await api.patch(
      `/api/admin/vouchers/${voucherIds.active}`,
      {
        headers: adminHeaders,
        data: updateVoucherPayloadFixture,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: voucherIds.active,
        discountValue: updateVoucherPayloadFixture.discountValue,
        maximumDiscountAmount: updateVoucherPayloadFixture.maximumDiscountAmount,
      }),
    );
    expect(voucherService.updateVoucherBeforeStart.calls).toEqual([
      [
        voucherIds.active,
        expect.objectContaining({
          discountValue: updateVoucherPayloadFixture.discountValue,
          maximumDiscountAmount: updateVoucherPayloadFixture.maximumDiscountAmount,
        }),
      ],
    ]);
  });

  test('PATCH /admin/vouchers/{voucherId}/deactivate deactivates voucher', async () => {
    voucherService.deactivateVoucher.mockResolvedValue({
      data: deactivateVoucherFixture,
    });

    const response = await api.patch(
      `/api/admin/vouchers/${voucherIds.active}/deactivate`,
      {
        headers: adminHeaders,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: voucherIds.active,
        status: 'INACTIVE',
      }),
    );
    expect(voucherService.deactivateVoucher.calls).toEqual([
      [voucherIds.active],
    ]);
  });

  for (const endpoint of [
    {
      method: 'post',
      path: '/api/admin/vouchers',
      data: createVoucherPayloadFixture,
    },
    { method: 'get', path: '/api/admin/vouchers' },
    { method: 'get', path: `/api/admin/vouchers/${voucherIds.active}` },
    {
      method: 'patch',
      path: `/api/admin/vouchers/${voucherIds.active}`,
      data: updateVoucherPayloadFixture,
    },
    {
      method: 'patch',
      path: `/api/admin/vouchers/${voucherIds.active}/deactivate`,
    },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
      expect(getVoucherServiceCallCount(voucherService)).toBe(0);
    });

    test(`non-admin cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        headers: customerHeaders,
        data: endpoint.data,
      });

      expect(response.status()).toBe(403);
      expect(getVoucherServiceCallCount(voucherService)).toBe(0);
    });
  }

  for (const invalidPayload of [
    { ...createVoucherPayloadFixture, code: '' },
    { ...createVoucherPayloadFixture, discountValue: -1 },
    { ...createVoucherPayloadFixture, startsAt: 'not-a-date' },
  ]) {
    test(`POST /admin/vouchers rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.post('/api/admin/vouchers', {
        headers: adminHeaders,
        data: invalidPayload,
      });
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).not.toHaveProperty('data');
      expect(voucherService.createVoucher.calls).toEqual([]);
    });
  }

  for (const invalidPayload of [
    { discountValue: -1 },
    { maximumDiscountAmount: -1 },
    { unknownField: true },
  ]) {
    test(`PATCH /admin/vouchers/{voucherId} rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.patch(
        `/api/admin/vouchers/${voucherIds.active}`,
        {
          headers: adminHeaders,
          data: invalidPayload,
        },
      );
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).not.toHaveProperty('data');
      expect(voucherService.updateVoucherBeforeStart.calls).toEqual([]);
    });
  }

  const invalidQueries: Array<Record<string, string | number | boolean>> = [
    { page: 0 },
    { limit: 101 },
    { status: 'unsupported' },
  ];

  for (const invalidQuery of invalidQueries) {
    test(`GET /admin/vouchers rejects invalid query ${JSON.stringify(invalidQuery)}`, async () => {
      const response = await api.get('/api/admin/vouchers', {
        headers: adminHeaders,
        params: invalidQuery,
      });
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).not.toHaveProperty('data');
      expect(voucherService.findAllVouchers.calls).toEqual([]);
    });
  }
});
