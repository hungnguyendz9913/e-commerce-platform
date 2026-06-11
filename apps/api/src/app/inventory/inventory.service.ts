import { BadRequestException, Injectable } from '@nestjs/common';
import { DbClient } from '@e-commerce-platform/database';
import { ProductInventoryDto } from '@e-commerce-platform/api-contracts';
import { InventoryRepository } from './inventory.repository';

type ProductInventory = {
  stockQuantity: number;
  reservedQuantity: number;
} | null;

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async initializeProductInventory(
    productId: string,
    inventory: ProductInventoryDto | undefined,
    client: DbClient,
  ) {
    const stockQuantity = inventory?.stockQuantity ?? 0;
    const reservedQuantity = inventory?.reservedQuantity ?? 0;

    this.assertInventoryValues({ stockQuantity, reservedQuantity });

    await this.inventoryRepository.createInventoryItem(
      {
        productId,
        stockQuantity,
        reservedQuantity,
      },
      client,
    );

    if (stockQuantity <= 0) {
      return;
    }

    await this.inventoryRepository.createInventoryMovement(
      {
        productId,
        movementType: 'IMPORT',
        quantity: stockQuantity,
        beforeQuantity: 0,
        afterQuantity: stockQuantity,
        reason: 'Initial product stock',
      },
      client,
    );
  }

  async updateProductInventoryFromAdminProduct(
    productId: string,
    existingInventory: ProductInventory,
    inventory: ProductInventoryDto,
    client: DbClient,
  ) {
    const previousStockQuantity = existingInventory?.stockQuantity ?? 0;
    const previousReservedQuantity = existingInventory?.reservedQuantity ?? 0;
    const next = {
      stockQuantity: inventory.stockQuantity ?? previousStockQuantity,
      reservedQuantity: inventory.reservedQuantity ?? previousReservedQuantity,
    };

    this.assertInventoryValues(next);

    await this.inventoryRepository.upsertInventoryItem(
      productId,
      {
        productId,
        stockQuantity: next.stockQuantity,
        reservedQuantity: next.reservedQuantity,
      },
      client,
    );

    if (
      inventory.stockQuantity === undefined ||
      previousStockQuantity === next.stockQuantity
    ) {
      return;
    }

    await this.inventoryRepository.createInventoryMovement(
      {
        productId,
        movementType: 'ADJUSTMENT',
        quantity: next.stockQuantity - previousStockQuantity,
        beforeQuantity: previousStockQuantity,
        afterQuantity: next.stockQuantity,
        reason: 'Admin product inventory update',
      },
      client,
    );
  }

  private assertInventoryValues(inventory: {
    stockQuantity: number;
    reservedQuantity: number;
  }) {
    if (
      inventory.stockQuantity < 0 ||
      inventory.reservedQuantity < 0 ||
      inventory.reservedQuantity > inventory.stockQuantity
    ) {
      throw new BadRequestException('Invalid inventory quantities');
    }
  }
}
