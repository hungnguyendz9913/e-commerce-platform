import { UnprocessableEntityException } from '@nestjs/common';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { CartRepository } from './cart.repository';

function createService() {
  const cartRepository = {
    getMyActiveCart: jest.fn(),
    createNewCartForUser: jest.fn(),
    findItemByCardIdAndProductId: jest.fn(),
    createCartItem: jest.fn(),
    incrementCartItemQuantity: jest.fn(),
    findCartItemByIdAndCartId: jest.fn(),
  };
  const productService = {
    findProductForCart: jest.fn().mockResolvedValue({
      id: 'product-id',
      price: 100000,
      inventoryItem: {
        stockQuantity: 5,
        reservedQuantity: 0,
      },
    }),
  };

  return {
    service: new CartService(
      cartRepository as unknown as CartRepository,
      productService as unknown as ProductsService,
    ),
    cartRepository,
  };
}

describe('CartService', () => {
  it('reuses the concurrently created active cart after a unique conflict', async () => {
    const { service, cartRepository } = createService();
    const cart = { id: 'cart-id', items: [] };
    cartRepository.getMyActiveCart
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cart);
    cartRepository.createNewCartForUser.mockRejectedValue({ code: 'P2002' });
    cartRepository.findItemByCardIdAndProductId.mockResolvedValue(null);
    cartRepository.createCartItem.mockResolvedValue({ id: 'item-id' });

    await expect(
      service.addItemToCart('user-id', {
        productId: 'product-id',
        quantity: 1,
      }),
    ).resolves.toEqual({ id: 'item-id' });

    expect(cartRepository.getMyActiveCart).toHaveBeenCalledTimes(2);
    expect(cartRepository.createCartItem).toHaveBeenCalledWith(
      expect.objectContaining({ cartId: 'cart-id' }),
    );
  });

  it('atomically increments an existing cart item', async () => {
    const { service, cartRepository } = createService();
    cartRepository.getMyActiveCart.mockResolvedValue({
      id: 'cart-id',
      items: [],
    });
    cartRepository.findItemByCardIdAndProductId.mockResolvedValue({
      id: 'item-id',
      quantity: 1,
    });
    cartRepository.incrementCartItemQuantity.mockResolvedValue({ count: 1 });
    cartRepository.findCartItemByIdAndCartId.mockResolvedValue({
      id: 'item-id',
      quantity: 2,
    });

    await expect(
      service.addItemToCart('user-id', {
        productId: 'product-id',
        quantity: 1,
      }),
    ).resolves.toEqual({ id: 'item-id', quantity: 2 });

    expect(cartRepository.incrementCartItemQuantity).toHaveBeenCalledWith(
      'item-id',
      1,
      5,
      100000,
    );
  });

  it('falls back to atomic increment when another request creates the item first', async () => {
    const { service, cartRepository } = createService();
    cartRepository.getMyActiveCart.mockResolvedValue({
      id: 'cart-id',
      items: [],
    });
    cartRepository.findItemByCardIdAndProductId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'item-id', quantity: 1 });
    cartRepository.createCartItem.mockRejectedValue({ code: 'P2002' });
    cartRepository.incrementCartItemQuantity.mockResolvedValue({ count: 1 });
    cartRepository.findCartItemByIdAndCartId.mockResolvedValue({
      id: 'item-id',
      quantity: 2,
    });

    await expect(
      service.addItemToCart('user-id', {
        productId: 'product-id',
        quantity: 1,
      }),
    ).resolves.toEqual({ id: 'item-id', quantity: 2 });

    expect(cartRepository.incrementCartItemQuantity).toHaveBeenCalledTimes(1);
  });

  it('rejects an increment that would exceed available stock', async () => {
    const { service, cartRepository } = createService();
    cartRepository.getMyActiveCart.mockResolvedValue({
      id: 'cart-id',
      items: [],
    });
    cartRepository.findItemByCardIdAndProductId.mockResolvedValue({
      id: 'item-id',
      quantity: 5,
    });
    cartRepository.incrementCartItemQuantity.mockResolvedValue({ count: 0 });

    await expect(
      service.addItemToCart('user-id', {
        productId: 'product-id',
        quantity: 1,
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(cartRepository.findCartItemByIdAndCartId).not.toHaveBeenCalled();
  });
});
