import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  activeVoucherFixture,
  categoryIds,
  productIds,
} from './fixtures';
import {
  closeVoucherApiTestApp,
  createVoucherApiTestApp,
  createVoucherServiceMock,
  expectDataEnvelope,
  resetVoucherServiceMock,
  type VoucherServiceMock,
} from './helpers';

test.describe('Public vouchers API', () => {
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

  test('GET /vouchers/products/{productId} returns active product vouchers without authentication', async () => {
    voucherService.findActiveVouchersForProduct.mockResolvedValue({
      data: [activeVoucherFixture],
    });

    const response = await api.get(
      `/api/vouchers/products/${productIds.keyboard}`,
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: activeVoucherFixture.id,
        code: activeVoucherFixture.code,
        scope: activeVoucherFixture.scope,
        status: activeVoucherFixture.status,
      }),
    ]);
    expect(voucherService.findActiveVouchersForProduct.calls).toEqual([
      [productIds.keyboard],
    ]);
  });

  test('GET /vouchers/categories/{categoryId} returns active category vouchers without authentication', async () => {
    voucherService.findActiveVouchersForCategory.mockResolvedValue({
      data: [activeVoucherFixture],
    });

    const response = await api.get(
      `/api/vouchers/categories/${categoryIds.accessories}`,
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual([
      expect.objectContaining({
        id: activeVoucherFixture.id,
        code: activeVoucherFixture.code,
        scope: activeVoucherFixture.scope,
        status: activeVoucherFixture.status,
      }),
    ]);
    expect(voucherService.findActiveVouchersForCategory.calls).toEqual([
      [categoryIds.accessories],
    ]);
  });
});
