import { BadRequestException } from '@nestjs/common';
import { DatabaseService } from '@e-commerce-platform/database';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';

function createInventoryService() {
  const transaction = {
    inventoryItem: {
      create: jest.fn().mockResolvedValue({ id: 'inventory-id' }),
      upsert: jest.fn().mockResolvedValue({ id: 'inventory-id' }),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
  };
  const databaseService = {} as DatabaseService;

  return {
    service: new InventoryService(new InventoryRepository(databaseService)),
    transaction,
  };
}

describe('InventoryService', () => {
  it('should initialize product inventory with submitted quantities and an import movement', async () => {
    const { service, transaction } = createInventoryService();

    await service.initializeProductInventory(
      'product-id',
      {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-id',
        stockQuantity: 5,
        reservedQuantity: 1,
      },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'product-id',
        movementType: 'IMPORT',
        quantity: 5,
        beforeQuantity: 0,
        afterQuantity: 5,
      }),
    });
  });

  it('should initialize product inventory with zero defaults and no movement', async () => {
    const { service, transaction } = createInventoryService();

    await service.initializeProductInventory(
      'product-id',
      undefined,
      transaction as never,
    );

    expect(transaction.inventoryItem.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-id',
        stockQuantity: 0,
        reservedQuantity: 0,
      },
    });
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should reject invalid inventory quantities during initialization', async () => {
    const { service, transaction } = createInventoryService();

    await expect(
      service.initializeProductInventory(
        'product-id',
        {
          stockQuantity: 1,
          reservedQuantity: 2,
        },
        transaction as never,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(transaction.inventoryItem.create).not.toHaveBeenCalled();
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should update product inventory and record stock adjustment movement', async () => {
    const { service, transaction } = createInventoryService();

    await service.updateProductInventoryFromAdminProduct(
      'product-id',
      {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      {
        stockQuantity: 8,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.upsert).toHaveBeenCalledWith({
      where: { productId: 'product-id' },
      create: {
        productId: 'product-id',
        stockQuantity: 8,
        reservedQuantity: 1,
      },
      update: {
        stockQuantity: 8,
        reservedQuantity: 1,
      },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'product-id',
        movementType: 'ADJUSTMENT',
        quantity: 3,
        beforeQuantity: 5,
        afterQuantity: 8,
      }),
    });
  });

  it('should update reserved quantity without recording stock movement', async () => {
    const { service, transaction } = createInventoryService();

    await service.updateProductInventoryFromAdminProduct(
      'product-id',
      {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      {
        reservedQuantity: 2,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.upsert).toHaveBeenCalledWith({
      where: { productId: 'product-id' },
      create: {
        productId: 'product-id',
        stockQuantity: 5,
        reservedQuantity: 2,
      },
      update: {
        stockQuantity: 5,
        reservedQuantity: 2,
      },
    });
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should not record movement when submitted stock is unchanged', async () => {
    const { service, transaction } = createInventoryService();

    await service.updateProductInventoryFromAdminProduct(
      'product-id',
      {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      {
        stockQuantity: 5,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.upsert).toHaveBeenCalledWith({
      where: { productId: 'product-id' },
      create: {
        productId: 'product-id',
        stockQuantity: 5,
        reservedQuantity: 1,
      },
      update: {
        stockQuantity: 5,
        reservedQuantity: 1,
      },
    });
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });
});
