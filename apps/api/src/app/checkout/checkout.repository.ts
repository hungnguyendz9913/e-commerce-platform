import { Injectable } from '@nestjs/common';
import {
  DatabaseService,
  DbClient,
  Prisma,
} from '@e-commerce-platform/database';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  findActiveCartWithItems(
    userId: string,
    client: DbClient = this.databaseService,
  ) {
    return client.cart.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                inventoryItem: true,
              },
            },
          },
        },
      },
    });
  }

  createOrder(
    data: Prisma.OrderCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.order.create({ data });
  }

  createOrderItems(
    items: Prisma.OrderItemCreateManyInput[],
    client: DbClient = this.databaseService,
  ) {
    return client.orderItem.createMany({ data: items });
  }

  claimCartForCheckout(
    cartId: string,
    client: DbClient = this.databaseService,
  ) {
    return client.cart.updateMany({
      where: {
        id: cartId,
        status: 'ACTIVE',
      },
      data: { status: 'CHECKED_OUT' },
    });
  }

  createPayment(
    data: Prisma.PaymentCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.payment.create({ data });
  }
}
