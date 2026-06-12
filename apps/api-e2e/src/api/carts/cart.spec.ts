import type { INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  adminHeaders,
  customerHeaders,
} from '../../support/api-test-app';
import {
  activeCartFixture,
  addCartItemPayloadFixture,
  addedCartItemFixture,
  cartIds,
  updatedCartItemFixture,
  updateCartItemQuantityPayloadFixture,
  successFixture,
} from './fixtures';
import {
  closeCartApiTestApp,
  createCartApiTestApp,
  createCartServiceMock,
  expectDataEnvelope,
  getCartServiceCallCount,
  resetCartServiceMock,
  type CartServiceMock,
} from './helpers';

test.describe('Cart API', () => {
  let app: INestApplication;
  let api: APIRequestContext;
  let cartService: CartServiceMock;

  test.beforeAll(async () => {
    cartService = createCartServiceMock();
    ({ app, api } = await createCartApiTestApp(cartService));
  });

  test.beforeEach(() => {
    resetCartServiceMock(cartService);
  });

  test.afterAll(async () => {
    await closeCartApiTestApp(app, api);
  });

  test('GET /cart returns the authenticated customer active cart', async () => {
    cartService.getMyActiveCart.mockResolvedValue({
      data: activeCartFixture,
    });

    const response = await api.get('/api/cart', {
      headers: customerHeaders,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: cartIds.active,
        subtotalAmount: 700000,
        totalAmount: 700000,
      }),
    );
    expect(body.data.items).toEqual([
      expect.objectContaining({
        id: cartIds.item,
        productId: addCartItemPayloadFixture.productId,
        quantity: 2,
        totalPrice: 700000,
        inStock: true,
      }),
    ]);
    expect(cartService.getMyActiveCart.calls).toEqual([['customer-id']]);
  });

  test('POST /cart/items adds an item for the authenticated customer', async () => {
    cartService.addItemToCart.mockResolvedValue({
      data: addedCartItemFixture,
    });

    const response = await api.post('/api/cart/items', {
      headers: customerHeaders,
      data: addCartItemPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: cartIds.item,
        productId: addCartItemPayloadFixture.productId,
        quantity: addCartItemPayloadFixture.quantity,
        unitPrice: 350000,
        totalPrice: 350000,
      }),
    );
    expect(cartService.addItemToCart.calls).toEqual([
      ['customer-id', expect.objectContaining(addCartItemPayloadFixture)],
    ]);
  });

  test('PATCH /cart/items/{itemId} updates quantity for the authenticated customer', async () => {
    cartService.updateCartItemQuantity.mockResolvedValue({
      data: updatedCartItemFixture,
    });

    const response = await api.patch(`/api/cart/items/${cartIds.item}`, {
      headers: customerHeaders,
      data: updateCartItemQuantityPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: cartIds.item,
        quantity: updateCartItemQuantityPayloadFixture.quantity,
        unitPrice: 350000,
        totalPrice: 1050000,
      }),
    );
    expect(cartService.updateCartItemQuantity.calls).toEqual([
      [
        'customer-id',
        cartIds.item,
        expect.objectContaining(updateCartItemQuantityPayloadFixture),
      ],
    ]);
  });

  test('DELETE /cart/items/{itemId} removes an item for the authenticated customer', async () => {
    cartService.removeCartItem.mockResolvedValue({
      data: successFixture,
    });

    const response = await api.delete(`/api/cart/items/${cartIds.item}`, {
      headers: customerHeaders,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toEqual({
      data: successFixture,
    });
    expect(cartService.removeCartItem.calls).toEqual([
      ['customer-id', cartIds.item],
    ]);
  });

  test('DELETE /cart clears the authenticated customer active cart', async () => {
    cartService.clearCart.mockResolvedValue({
      data: successFixture,
    });

    const response = await api.delete('/api/cart', {
      headers: customerHeaders,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toEqual({
      data: successFixture,
    });
    expect(cartService.clearCart.calls).toEqual([['customer-id']]);
  });

  for (const endpoint of [
    { method: 'get', path: '/api/cart' },
    {
      method: 'post',
      path: '/api/cart/items',
      data: addCartItemPayloadFixture,
    },
    {
      method: 'patch',
      path: `/api/cart/items/${cartIds.item}`,
      data: updateCartItemQuantityPayloadFixture,
    },
    { method: 'delete', path: `/api/cart/items/${cartIds.item}` },
    { method: 'delete', path: '/api/cart' },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
      expect(getCartServiceCallCount(cartService)).toBe(0);
    });

    test(`non-customer cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        headers: adminHeaders,
        data: endpoint.data,
      });

      expect(response.status()).toBe(403);
      expect(getCartServiceCallCount(cartService)).toBe(0);
    });
  }

  for (const invalidPayload of [
    { productId: 'not-a-uuid', quantity: 1 },
    { productId: addCartItemPayloadFixture.productId, quantity: 1.5 },
    { productId: addCartItemPayloadFixture.productId, quantity: 0 },
  ]) {
    test(`POST /cart/items rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.post('/api/cart/items', {
        headers: customerHeaders,
        data: invalidPayload,
      });
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).not.toHaveProperty('data');
      expect(cartService.addItemToCart.calls).toEqual([]);
    });
  }

  for (const invalidPayload of [
    {},
    { quantity: 1.5 },
    { quantity: 0 },
  ]) {
    test(`PATCH /cart/items/{itemId} rejects invalid payload ${JSON.stringify(invalidPayload)}`, async () => {
      const response = await api.patch(`/api/cart/items/${cartIds.item}`, {
        headers: customerHeaders,
        data: invalidPayload,
      });
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).not.toHaveProperty('data');
      expect(cartService.updateCartItemQuantity.calls).toEqual([]);
    });
  }
});
