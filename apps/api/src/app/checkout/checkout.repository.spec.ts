import { DatabaseService } from '@e-commerce-platform/database';
import { CheckoutRepository } from './checkout.repository';

describe('CheckoutRepository', () => {
  it('claims a cart only while it is still active', async () => {
    const transaction = {
      cart: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const repository = new CheckoutRepository({} as DatabaseService);

    await expect(
      repository.claimCartForCheckout('cart-id', transaction as never),
    ).resolves.toEqual({ count: 1 });

    expect(transaction.cart.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'cart-id',
        status: 'ACTIVE',
      },
      data: {
        status: 'CHECKED_OUT',
      },
    });
  });
});
