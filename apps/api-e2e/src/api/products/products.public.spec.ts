import { NotFoundException, type INestApplication } from '@nestjs/common';
import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  categoryFixture,
  paginationMetaFixture,
  productIds,
  publicProductDetailFixture,
  publicProductSummaryFixture,
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

test.describe('Public products API', () => {
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

  test('GET /products returns visible products with filters and pagination metadata', async () => {
    productsService.listPublicProducts.mockResolvedValue({
      data: [publicProductSummaryFixture],
      meta: paginationMetaFixture,
    });

    const response = await api.get('/api/products', {
      params: {
        q: 'keyboard',
        categoryId: categoryFixture.id,
        minPrice: 100000,
        maxPrice: 500000,
        inStock: true,
        page: 1,
        limit: 20,
        sortBy: 'price',
        sortOrder: 'asc',
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expectPaginationMeta(body);
    expect(body.data).toEqual([publicProductSummaryFixture]);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: productIds.visible,
        name: 'Wireless Keyboard',
        price: 350000,
        category: expect.objectContaining({
          id: categoryFixture.id,
          name: categoryFixture.name,
        }),
        inStock: true,
      }),
    );
    expect(productsService.listPublicProducts.calls[0][0]).toEqual(
      expect.objectContaining({
        q: 'keyboard',
        categoryId: categoryFixture.id,
        minPrice: 100000,
        maxPrice: 500000,
        inStock: true,
        page: 1,
        limit: 20,
        sortBy: 'price',
        sortOrder: 'asc',
      }),
    );
  });

  test('GET /products/{id} returns visible product detail fields', async () => {
    productsService.getPublicProduct.mockResolvedValue({
      data: publicProductDetailFixture,
    });

    const response = await api.get(`/api/products/${productIds.visible}`);
    const body = await response.json();

    expect(response.status()).toBe(200);
    expectDataEnvelope(body);
    expect(body.data).toEqual(
      expect.objectContaining({
        id: productIds.visible,
        sku: 'KB-001',
        name: 'Wireless Keyboard',
        description: 'Compact wireless keyboard.',
        price: 350000,
        category: expect.objectContaining({
          id: categoryFixture.id,
          name: categoryFixture.name,
        }),
        images: expect.arrayContaining([
          expect.objectContaining({
            imageUrl: 'https://example.com/keyboard.png',
            isPrimary: true,
          }),
        ]),
        stockQuantity: 20,
      }),
    );
    expect(productsService.getPublicProduct.calls).toEqual([
      [productIds.visible],
    ]);
  });

  test('GET /products/{id} does not expose hidden product detail', async () => {
    productsService.getPublicProduct.mockRejectedValue(
      new NotFoundException('Product not found or not visible'),
    );

    const response = await api.get(`/api/products/${productIds.hidden}`);
    const body = await response.json();

    expect(response.status()).toBe(404);
    expect(body).not.toHaveProperty('data');
    expect(productsService.getPublicProduct.calls).toEqual([
      [productIds.hidden],
    ]);
  });
});
