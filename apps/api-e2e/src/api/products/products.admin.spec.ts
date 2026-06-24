import {
  ConflictException,
  type INestApplication,
} from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  adminHeaders,
  customerHeaders,
} from '../../support/api-test-app';
import {
  adminProductDetailFixture,
  adminProductSummaryFixture,
  createProductPayloadFixture,
  paginationMetaFixture,
  productIds,
  updatedAdminProductDetailFixture,
  updateProductPayloadFixture,
} from './fixtures';
import {
  closeProductsApiTestApp,
  createProductsApiTestApp,
  createProductsServiceMock,
  expectDataEnvelope,
  expectPaginationMeta,
  resetProductsServiceMock,
  type ProductsServiceMock,
} from './helpers';

test.describe('Admin products API', () => {
  let app: INestApplication;
  let api: APIRequestContext;
  let productsService: ProductsServiceMock;

  test.beforeAll(async () => {
    productsService = createProductsServiceMock();
    ({ app, api } = await createProductsApiTestApp(productsService));
  });

  test.beforeEach(() => {
    resetProductsServiceMock(productsService);
  });

  test.afterAll(async () => {
    await closeProductsApiTestApp(app, api);
  });

  test('GET /admin/products returns managed products with filters and pagination metadata', async () => {
    productsService.listAdminProducts.mockResolvedValue({
      data: [adminProductSummaryFixture],
      meta: paginationMetaFixture,
    });

    const response = await api.get('/api/admin/products', {
      headers: adminHeaders,
      params: {
        q: 'keyboard',
        categoryId: adminProductSummaryFixture.category.id,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        page: 1,
        limit: 20,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expectPaginationMeta(body);
    expect(body.data).toEqual([adminProductSummaryFixture]);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: productIds.admin,
        sku: 'KB-001',
        status: 'active',
        approvalStatus: 'approved',
        stockQuantity: 20,
        reservedQuantity: 0,
      }),
    );
    expect(productsService.listAdminProducts.calls[0][0]).toEqual(
      expect.objectContaining({
        q: 'keyboard',
        categoryId: adminProductSummaryFixture.category.id,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        page: 1,
        limit: 20,
      }),
    );
  });

  test('POST /admin/products creates a product from the documented payload shape', async () => {
    productsService.createProduct.mockResolvedValue({
      data: adminProductDetailFixture,
    });

    const response = await api.post('/api/admin/products', {
      headers: adminHeaders,
      data: createProductPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(201);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: productIds.admin,
        sku: createProductPayloadFixture.sku,
        name: createProductPayloadFixture.name,
        price: createProductPayloadFixture.price,
        status: 'active',
        approvalStatus: 'approved',
        stockQuantity: 20,
      }),
    );
    expect(body.data.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          imageUrl: createProductPayloadFixture.images[0].imageUrl,
          isPrimary: true,
        }),
      ]),
    );
    expect(productsService.createProduct.calls[0][0]).toEqual(
      expect.objectContaining(createProductPayloadFixture),
    );
  });

  test('PATCH /admin/products/{productId} updates submitted product fields', async () => {
    productsService.updateProduct.mockResolvedValue({
      data: updatedAdminProductDetailFixture,
    });

    const response = await api.patch(`/api/admin/products/${productIds.admin}`, {
      headers: adminHeaders,
      data: updateProductPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: productIds.admin,
        name: updateProductPayloadFixture.name,
        description: updateProductPayloadFixture.description,
        price: updateProductPayloadFixture.price,
        status: 'active',
      }),
    );
    expect(productsService.updateProduct.calls).toEqual([
      [productIds.admin, expect.objectContaining(updateProductPayloadFixture)],
    ]);
  });

  test('DELETE /admin/products/{productId} returns delete or archive result', async () => {
    productsService.deleteProduct.mockResolvedValue({
      data: {
        deleted: false,
        archived: true,
        product: {
          ...adminProductDetailFixture,
          status: 'archived',
        },
      },
    });

    const response = await api.delete(
      `/api/admin/products/${productIds.admin}`,
      {
        headers: adminHeaders,
      },
    );
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        deleted: false,
        archived: true,
        product: expect.objectContaining({
          id: productIds.admin,
          status: 'archived',
        }),
      }),
    );
    expect(productsService.deleteProduct.calls).toEqual([[productIds.admin]]);
  });

  test('POST /admin/products rejects invalid product payloads', async () => {
    const response = await api.post('/api/admin/products', {
      headers: adminHeaders,
      data: {
        ...createProductPayloadFixture,
        price: -1,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).not.toHaveProperty('data');
    expect(productsService.createProduct.calls).toEqual([]);
  });

  test('POST /admin/products rejects duplicate SKU or slug conflicts', async () => {
    productsService.createProduct.mockRejectedValue(
      new ConflictException('Product SKU or slug already exists'),
    );

    const response = await api.post('/api/admin/products', {
      headers: adminHeaders,
      data: createProductPayloadFixture,
    });
    const body = await response.json();

    expect(response.status()).toBe(409);
    expect(body).not.toHaveProperty('data');
    expect(productsService.createProduct.calls).toHaveLength(1);
  });

  for (const endpoint of [
    { method: 'get', path: '/api/admin/products' },
    { method: 'post', path: '/api/admin/products', data: createProductPayloadFixture },
    {
      method: 'patch',
      path: `/api/admin/products/${productIds.admin}`,
      data: updateProductPayloadFixture,
    },
    { method: 'delete', path: `/api/admin/products/${productIds.admin}` },
  ] as const) {
    test(`guest cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        data: endpoint.data,
      });

      expect(response.status()).toBe(401);
    });

    test(`non-admin cannot ${endpoint.method.toUpperCase()} ${endpoint.path}`, async () => {
      const response = await api[endpoint.method](endpoint.path, {
        headers: customerHeaders,
        data: endpoint.data,
      });

      expect(response.status()).toBe(403);
    });
  }

  test('POST /admin/products rejects a price exceeding database precision', async () => {
    const response = await api.post('/api/admin/products', {
      headers: adminHeaders,
      data: {
        ...createProductPayloadFixture,
        price: 10_000_000_000,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).not.toHaveProperty('data');
    expect(productsService.createProduct.calls).toEqual([]);
  });

  test('PATCH /admin/products/{productId} rejects a price exceeding database precision', async () => {
    const response = await api.patch(
      `/api/admin/products/${productIds.admin}`,
      {
        headers: adminHeaders,
        data: {
          price: 10_000_000_000,
        },
      },
    );

    const body = await response.json();

    expect(response.status()).toBe(400);
    expect(body).not.toHaveProperty('data');
    expect(productsService.updateProduct.calls).toEqual([]);
  });
});
