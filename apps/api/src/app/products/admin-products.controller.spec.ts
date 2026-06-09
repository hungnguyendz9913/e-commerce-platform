import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesGuard } from '@e-commerce-platform/api-common';
import { Roles as RoleValues } from '@e-commerce-platform/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';

describe('AdminProductsController', () => {
  const productsService = {
    listAdminProducts: jest.fn(),
    createProduct: jest.fn(),
    getAdminProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  };
  let controller: AdminProductsController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new AdminProductsController(
      productsService as unknown as ProductsService,
    );
  });

  it('should be mounted at /admin/products with admin guards', () => {
    const reflector = new Reflector();

    expect(Reflect.getMetadata(PATH_METADATA, AdminProductsController)).toBe(
      'admin/products',
    );
    expect(
      Reflect.getMetadata(GUARDS_METADATA, AdminProductsController),
    ).toEqual([JwtAuthGuard, RolesGuard]);
    expect(
      reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        AdminProductsController,
      ]),
    ).toEqual([RoleValues.ADMIN]);
  });

  it('should delegate admin product routes to the service', async () => {
    productsService.listAdminProducts.mockResolvedValue({ data: [] });
    productsService.createProduct.mockResolvedValue({ data: { id: 'p1' } });
    productsService.getAdminProduct.mockResolvedValue({ data: { id: 'p1' } });
    productsService.updateProduct.mockResolvedValue({ data: { id: 'p1' } });
    productsService.deleteProduct.mockResolvedValue({
      data: { deleted: true, archived: false, id: 'p1' },
    });

    await expect(controller.listProducts({})).resolves.toEqual({ data: [] });
    await expect(
      controller.createProduct({
        sku: 'SKU-1',
        name: 'Product',
        slug: 'product',
        price: 100,
        categoryId: 'category-id',
      }),
    ).resolves.toEqual({ data: { id: 'p1' } });
    await expect(controller.getProduct('p1')).resolves.toEqual({
      data: { id: 'p1' },
    });
    await expect(controller.updateProduct('p1', { name: 'Updated' })).resolves.toEqual(
      { data: { id: 'p1' } },
    );
    await expect(controller.deleteProduct('p1')).resolves.toEqual({
      data: { deleted: true, archived: false, id: 'p1' },
    });
  });
});
