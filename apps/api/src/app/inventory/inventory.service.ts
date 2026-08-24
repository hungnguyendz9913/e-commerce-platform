import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DbClient } from '@e-commerce-platform/database';
import { ProductInventoryDto } from '@e-commerce-platform/api-contracts';
import { InventoryRepository } from './inventory.repository';
import { InventoryMovementType } from '@e-commerce-platform/types';

type ProductInventory = {
  stockQuantity: number;
  reservedQuantity: number;
  version: number;
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

    if (!existingInventory) {
      await this.inventoryRepository.createInventoryItem(
        { productId, ...next },
        client,
      );
    } else {
      const updateResult = await this.inventoryRepository.updateInventoryItem(
        productId,
        existingInventory.version,
        next,
        client,
      );

      this.assertInventoryMutationSucceeded(updateResult.count, productId);
    }

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

  private assertInventoryMutationSucceeded(count: number, productId: string) {
    if (count === 0) {
      throw new ConflictException({
        code: 'INVENTORY_CONCURRENCY_CONFLICT',
        message: `Inventory for product ${productId} was modified concurrently. Please retry.`,
      });
    }
  }

  async deductStockForCheckout(
    productId: string,
    quantity: number,
    orderId: string,
    client: DbClient,
  ) {
    const inventoryItem =
      await this.inventoryRepository.findInventoryItemByProductId(
        productId,
        client,
      );

    if (!inventoryItem) {
      throw new NotFoundException('Inventory item not found');
    }

    const availableStock =
      inventoryItem.stockQuantity - inventoryItem.reservedQuantity;

    if (availableStock < quantity) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: `Insufficient stock for product ${productId}. Available: ${availableStock}, requested: ${quantity}.`,
      });
    }

    const beforeQuantity = inventoryItem.stockQuantity;
    const afterQuantity = beforeQuantity - quantity;

    const updateResult = await this.inventoryRepository.decreaseStock(
      productId,
      quantity,
      inventoryItem.version,
      client,
    );

    this.assertInventoryMutationSucceeded(updateResult.count, productId);

    await this.inventoryRepository.createInventoryMovement(
      {
        productId,
        movementType: InventoryMovementType.SALE,
        quantity,
        beforeQuantity,
        afterQuantity,
        reason: 'Checkout order',
        referenceId: orderId,
      },
      client,
    );
  }

  async restoreStockForCanceledOrder(
    order: {
      id: string;
      items: {
        productId: string;
        quantity: number;
      }[];
    },
    client: DbClient,
  ) {
    for (const item of order.items) {
      const inventoryItem =
        await this.inventoryRepository.findInventoryItemByProductId(
          item.productId,
          client,
        );

      if (!inventoryItem) {
        throw new NotFoundException('Inventory item not found');
      }

      const beforeQuantity = inventoryItem.stockQuantity;
      const afterQuantity = beforeQuantity + item.quantity;

      const updateResult = await this.inventoryRepository.increaseStock(
        item.productId,
        item.quantity,
        inventoryItem.version,
        client,
      );

      this.assertInventoryMutationSucceeded(updateResult.count, item.productId);

      await this.inventoryRepository.createInventoryMovement(
        {
          productId: item.productId,
          movementType: InventoryMovementType.CANCELLATION,
          quantity: item.quantity,
          beforeQuantity,
          afterQuantity,
          reason: 'Order canceled',
          referenceId: order.id,
        },
        client,
      );
    }
  }
}
