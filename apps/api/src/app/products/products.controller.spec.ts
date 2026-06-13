import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  const productsService = {
    listPublicProducts: jest.fn(),
    getPublicProduct: jest.fn(),
  };
  let controller: ProductsController;

  beforeEach(() => {
    jest.resetAllMocks();
    controller = new ProductsController(
      productsService as unknown as ProductsService,
    );
  });

  it('should expose public product routes', () => {
    expect(Reflect.getMetadata(PATH_METADATA, ProductsController)).toBe(
      'products',
    );
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProductsController.prototype.listProducts,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProductsController.prototype.listProducts,
      ),
    ).toBe('/');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        ProductsController.prototype.getProduct,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        ProductsController.prototype.getProduct,
      ),
    ).toBe(':id');
  });

  it('should delegate public product routes to the service', async () => {
    const query = { q: 'shoe', page: 2, limit: 10 };
    productsService.listPublicProducts.mockResolvedValue({ data: [] });
    productsService.getPublicProduct.mockResolvedValue({ data: { id: 'p1' } });

    await expect(controller.listProducts(query)).resolves.toEqual({ data: [] });
    await expect(controller.getProduct('p1')).resolves.toEqual({
      data: { id: 'p1' },
    });

    expect(productsService.listPublicProducts).toHaveBeenCalledWith(query);
    expect(productsService.getPublicProduct).toHaveBeenCalledWith('p1');
  });
});
