/* eslint-disable @nx/enforce-module-boundaries */
import { type INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { RolesGuard } from '@e-commerce-platform/api-common';
import {
  closeApiTestResources,
  createApiContext,
  createApiTestApp,
  createMockFunction,
  createTokenAuthGuard,
  type MockFunction,
} from '../../support/api-test-app';

const { VoucherController } =
  require('../../../../api/src/app/vouchers/voucher.controller') as typeof import('../../../../api/src/app/vouchers/voucher.controller');
const { VoucherService } =
  require('../../../../api/src/app/vouchers/voucher.service') as typeof import('../../../../api/src/app/vouchers/voucher.service');
const { JwtAuthGuard } =
  require('../../../../api/src/app/auth/guards/jwt-auth.guard') as typeof import('../../../../api/src/app/auth/guards/jwt-auth.guard');

export type VoucherServiceMock = {
  findActiveVouchersForProduct: MockFunction;
  findActiveVouchersForCategory: MockFunction;
  createVoucher: MockFunction;
  findAllVouchers: MockFunction;
  findVoucherById: MockFunction;
  updateVoucherBeforeStart: MockFunction;
  deactivateVoucher: MockFunction;
};

export function createVoucherServiceMock(): VoucherServiceMock {
  return {
    findActiveVouchersForProduct: createMockFunction(),
    findActiveVouchersForCategory: createMockFunction(),
    createVoucher: createMockFunction(),
    findAllVouchers: createMockFunction(),
    findVoucherById: createMockFunction(),
    updateVoucherBeforeStart: createMockFunction(),
    deactivateVoucher: createMockFunction(),
  };
}

export function resetVoucherServiceMock(voucherService: VoucherServiceMock) {
  for (const mock of Object.values(voucherService)) {
    mock.reset();
  }
}

export function getVoucherServiceCallCount(voucherService: VoucherServiceMock) {
  return Object.values(voucherService).reduce(
    (callCount, mock) => callCount + mock.calls.length,
    0,
  );
}

export async function createVoucherApiTestApp(
  voucherService: VoucherServiceMock,
) {
  const app = await createApiTestApp({
    controllers: [VoucherController],
    providers: [
      {
        provide: VoucherService,
        useValue: voucherService,
      },
      RolesGuard,
    ],
    overrideGuards: [
      {
        guard: JwtAuthGuard,
        value: createTokenAuthGuard(),
      },
    ],
  });
  const api = await createApiContext(app);

  return { app, api };
}

export async function closeVoucherApiTestApp(
  app: INestApplication | undefined,
  api: APIRequestContext | undefined,
) {
  await closeApiTestResources(app, api);
}

export function expectDataEnvelope(body: unknown) {
  expect(body).toEqual(expect.objectContaining({ data: expect.anything() }));
}

export function expectPaginationMeta(body: {
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}) {
  expect(body.meta).toEqual(
    expect.objectContaining({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    }),
  );
}
