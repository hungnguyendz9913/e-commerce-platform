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

const { AdminProductsController } =
  require('../../../../api/src/app/products/admin-products.controller') as typeof import('../../../../api/src/app/products/admin-products.controller');
const { ProductsController } =
  require('../../../../api/src/app/products/products.controller') as typeof import('../../../../api/src/app/products/products.controller');
const { ProductsService } =
  require('../../../../api/src/app/products/products.service') as typeof import('../../../../api/src/app/products/products.service');
const { JwtAuthGuard } =
  require('../../../../api/src/app/auth/guards/jwt-auth.guard') as typeof import('../../../../api/src/app/auth/guards/jwt-auth.guard');

export type ProductsServiceMock = {
  listAdminProducts: MockFunction;
  listPublicProducts: MockFunction;
  getAdminProduct: MockFunction;
  getPublicProduct: MockFunction;
  createProduct: MockFunction;
  updateProduct: MockFunction;
  deleteProduct: MockFunction;
};

export function createProductsServiceMock(): ProductsServiceMock {
  return {
    listAdminProducts: createMockFunction(),
    listPublicProducts: createMockFunction(),
    getAdminProduct: createMockFunction(),
    getPublicProduct: createMockFunction(),
    createProduct: createMockFunction(),
    updateProduct: createMockFunction(),
    deleteProduct: createMockFunction(),
  };
}

export function resetProductsServiceMock(productsService: ProductsServiceMock) {
  for (const mock of Object.values(productsService)) {
    mock.reset();
  }
}

export async function createProductsApiTestApp(
  productsService: ProductsServiceMock,
) {
  const app = await createApiTestApp({
    controllers: [ProductsController, AdminProductsController],
    providers: [
      {
        provide: ProductsService,
        useValue: productsService,
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

export async function closeProductsApiTestApp(
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
