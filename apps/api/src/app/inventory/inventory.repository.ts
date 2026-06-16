import { DatabaseService, DbClient, Prisma } from '@e-commerce-platform/database';
import { InventoryMovementType } from '@e-commerce-platform/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  createInventoryItem(
    data: Prisma.InventoryItemCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.inventoryItem.create({ data });
  }

  upsertInventoryItem(
    productId: string,
    data: Prisma.InventoryItemUncheckedCreateInput,
    client: DbClient = this.databaseService,
  ) {
    return client.inventoryItem.upsert({
      where: { productId },
      create: data,
      update: {
        stockQuantity: data.stockQuantity,
        reservedQuantity: data.reservedQuantity,
      },
    });
  }

  createInventoryMovement(
    data: Prisma.InventoryMovementCreateArgs['data'],
    client: DbClient = this.databaseService,
  ) {
    return client.inventoryMovement.create({ data });
  }

  async findInventoryItemByProductId(productId: string, client: DbClient) {
    return client.inventoryItem.findUnique({
      where: {
        productId,
      },
    });
  }

  async increaseStock(productId: string, quantity: number, client: DbClient) {
    return client.inventoryItem.update({
      where: {
        productId,
      },
      data: {
        stockQuantity: {
          increment: quantity,
        },
        version: {
          increment: 1,
        },
      },
    });
  }

  async decreaseStock(productId: string, quantity: number, client: DbClient) {
    return client.inventoryItem.update({
      where: { productId },
      data: {
        stockQuantity: { decrement: quantity },
        version: { increment: 1 },
      },
    });
  }

  async createCancellationMovement(
    data: {
      productId: string;
      quantity: number;
      beforeQuantity: number;
      afterQuantity: number;
      referenceId: string;
      reason?: string;
    },
    client: DbClient,
  ) {
    return client.inventoryMovement.create({
      data: {
        productId: data.productId,
        movementType: InventoryMovementType.CANCELLATION,
        quantity: data.quantity,
        beforeQuantity: data.beforeQuantity,
        afterQuantity: data.afterQuantity,
        reason: data.reason ?? 'Order canceled',
        referenceId: data.referenceId,
      },
    });
  }
}
