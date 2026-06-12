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

const { CartController } =
  require('../../../../api/src/app/carts/cart.controller') as typeof import('../../../../api/src/app/carts/cart.controller');
const { CartService } =
  require('../../../../api/src/app/carts/cart.service') as typeof import('../../../../api/src/app/carts/cart.service');
const { JwtAuthGuard } =
  require('../../../../api/src/app/auth/guards/jwt-auth.guard') as typeof import('../../../../api/src/app/auth/guards/jwt-auth.guard');

export type CartServiceMock = {
  getMyActiveCart: MockFunction;
  addItemToCart: MockFunction;
  updateCartItemQuantity: MockFunction;
  removeCartItem: MockFunction;
  clearCart: MockFunction;
};

export function createCartServiceMock(): CartServiceMock {
  return {
    getMyActiveCart: createMockFunction(),
    addItemToCart: createMockFunction(),
    updateCartItemQuantity: createMockFunction(),
    removeCartItem: createMockFunction(),
    clearCart: createMockFunction(),
  };
}

export function resetCartServiceMock(cartService: CartServiceMock) {
  for (const mock of Object.values(cartService)) {
    mock.reset();
  }
}

export function getCartServiceCallCount(cartService: CartServiceMock) {
  return Object.values(cartService).reduce(
    (callCount, mock) => callCount + mock.calls.length,
    0,
  );
}

export async function createCartApiTestApp(cartService: CartServiceMock) {
  const app = await createApiTestApp({
    controllers: [CartController],
    providers: [
      {
        provide: CartService,
        useValue: cartService,
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

export async function closeCartApiTestApp(
  app: INestApplication | undefined,
  api: APIRequestContext | undefined,
) {
  await closeApiTestResources(app, api);
}

export function expectDataEnvelope(body: unknown) {
  expect(body).toEqual(expect.objectContaining({ data: expect.anything() }));
}
