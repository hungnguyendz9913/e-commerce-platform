import { DatabaseService, DbClient, Prisma } from '@e-commerce-platform/database';
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
}
