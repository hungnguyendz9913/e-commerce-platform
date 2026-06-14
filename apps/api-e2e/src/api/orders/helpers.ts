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

const { OrderController } =
  require('../../../../api/src/app/orders/order.controller') as typeof import('../../../../api/src/app/orders/order.controller');
const { OrderService } =
  require('../../../../api/src/app/orders/order.service') as typeof import('../../../../api/src/app/orders/order.service');
const { JwtAuthGuard } =
  require('../../../../api/src/app/auth/guards/jwt-auth.guard') as typeof import('../../../../api/src/app/auth/guards/jwt-auth.guard');

export type OrderServiceMock = {
  getMyOrderList: MockFunction;
  getMyOrderDetail: MockFunction;
  cancelMyOrder: MockFunction;
};

export function createOrderServiceMock(): OrderServiceMock {
  return {
    getMyOrderList: createMockFunction(),
    getMyOrderDetail: createMockFunction(),
    cancelMyOrder: createMockFunction(),
  };
}

export function resetOrderServiceMock(orderService: OrderServiceMock) {
  for (const mock of Object.values(orderService)) {
    mock.reset();
  }
}

export function getOrderServiceCallCount(orderService: OrderServiceMock) {
  return Object.values(orderService).reduce(
    (callCount, mock) => callCount + mock.calls.length,
    0,
  );
}

export async function createOrderApiTestApp(orderService: OrderServiceMock) {
  const app = await createApiTestApp({
    controllers: [OrderController],
    providers: [
      {
        provide: OrderService,
        useValue: orderService,
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

export async function closeOrderApiTestApp(
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
