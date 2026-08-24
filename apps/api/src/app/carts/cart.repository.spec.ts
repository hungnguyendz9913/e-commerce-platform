import { DatabaseService, Prisma } from '@e-commerce-platform/database';
import { CartRepository } from './cart.repository';

describe('CartRepository', () => {
  it('increments quantity atomically without exceeding the supplied maximum', async () => {
    const databaseService = {
      cartItem: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const repository = new CartRepository(
      databaseService as unknown as DatabaseService,
    );
    const price = 100000 as unknown as Prisma.Decimal;

    await expect(
      repository.incrementCartItemQuantity('item-id', 2, 5, price),
    ).resolves.toEqual({ count: 1 });

    expect(databaseService.cartItem.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'item-id',
        quantity: { lte: 3 },
      },
      data: {
        quantity: { increment: 2 },
        unitPriceSnapshot: price,
      },
    });
  });
});
