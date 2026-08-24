import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '@e-commerce-platform/database';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';

function createInventoryService() {
  const transaction = {
    inventoryItem: {
      create: jest.fn().mockResolvedValue({ id: 'inventory-id' }),
      findUnique: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
        version: 3,
      },
      {
        stockQuantity: 8,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-id', version: 3 },
      data: {
        stockQuantity: 8,
        reservedQuantity: 1,
        version: { increment: 1 },
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
        version: 4,
      },
      {
        reservedQuantity: 2,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-id', version: 4 },
      data: {
        stockQuantity: 5,
        reservedQuantity: 2,
        version: { increment: 1 },
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
        version: 5,
      },
      {
        stockQuantity: 5,
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-id', version: 5 },
      data: {
        stockQuantity: 5,
        reservedQuantity: 1,
        version: { increment: 1 },
      },
    });
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should reject a stale admin inventory update without recording movement', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateProductInventoryFromAdminProduct(
        'product-id',
        { stockQuantity: 5, reservedQuantity: 1, version: 2 },
        { stockQuantity: 8 },
        transaction as never,
      ),
    ).rejects.toThrow(ConflictException);

    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-id', version: 2 },
      data: {
        stockQuantity: 8,
        reservedQuantity: 1,
        version: { increment: 1 },
      },
    });
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should deduct stock with the version read and record the sale movement', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue({
      productId: 'product-id',
      stockQuantity: 5,
      reservedQuantity: 1,
      version: 7,
    });

    await service.deductStockForCheckout(
      'product-id',
      2,
      'order-id',
      transaction as never,
    );

    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-id', version: 7 },
      data: {
        stockQuantity: { decrement: 2 },
        version: { increment: 1 },
      },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        movementType: 'SALE',
        beforeQuantity: 5,
        afterQuantity: 3,
      }),
    });
  });

  it('should throw on a stale checkout version without recording movement', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue({
      productId: 'product-id',
      stockQuantity: 5,
      reservedQuantity: 1,
      version: 7,
    });
    transaction.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.deductStockForCheckout(
        'product-id',
        2,
        'order-id',
        transaction as never,
      ),
    ).rejects.toThrow(ConflictException);

    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should preserve the insufficient-stock business rule', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue({
      productId: 'product-id',
      stockQuantity: 5,
      reservedQuantity: 4,
      version: 7,
    });

    await expect(
      service.deductStockForCheckout(
        'product-id',
        2,
        'order-id',
        transaction as never,
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(transaction.inventoryItem.updateMany).not.toHaveBeenCalled();
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should restore stock and record cancellation movement for canceled order items', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue({
      productId: 'product-id',
      stockQuantity: 3,
      reservedQuantity: 0,
      version: 9,
    });

    await service.restoreStockForCanceledOrder(
      {
        id: '11111111-1111-4111-8111-111111111111',
        items: [
          {
            productId: 'product-id',
            quantity: 2,
          },
        ],
      },
      transaction as never,
    );

    expect(transaction.inventoryItem.findUnique).toHaveBeenCalledWith({
      where: {
        productId: 'product-id',
      },
    });
    expect(transaction.inventoryItem.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-id',
        version: 9,
      },
      data: {
        stockQuantity: {
          increment: 2,
        },
        version: {
          increment: 1,
        },
      },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'product-id',
        movementType: 'CANCELLATION',
        quantity: 2,
        beforeQuantity: 3,
        afterQuantity: 5,
        reason: 'Order canceled',
        referenceId: '11111111-1111-4111-8111-111111111111',
      }),
    });
  });

  it('should throw on stale cancellation state without recording movement', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue({
      productId: 'product-id',
      stockQuantity: 3,
      reservedQuantity: 0,
      version: 9,
    });
    transaction.inventoryItem.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.restoreStockForCanceledOrder(
        {
          id: '11111111-1111-4111-8111-111111111111',
          items: [{ productId: 'product-id', quantity: 2 }],
        },
        transaction as never,
      ),
    ).rejects.toThrow(ConflictException);

    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('should reject canceled order stock restoration when inventory item is missing', async () => {
    const { service, transaction } = createInventoryService();
    transaction.inventoryItem.findUnique.mockResolvedValue(null);

    await expect(
      service.restoreStockForCanceledOrder(
        {
          id: '11111111-1111-4111-8111-111111111111',
          items: [
            {
              productId: 'product-id',
              quantity: 2,
            },
          ],
        },
        transaction as never,
      ),
    ).rejects.toThrow(NotFoundException);
    expect(transaction.inventoryItem.updateMany).not.toHaveBeenCalled();
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
  });
});
