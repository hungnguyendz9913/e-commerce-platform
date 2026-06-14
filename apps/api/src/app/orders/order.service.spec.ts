import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionService } from '@e-commerce-platform/database';
import { OrderStatus } from '@e-commerce-platform/types';
import { InventoryService } from '../inventory/inventory.service';
import { OrderRepository } from './order.repository';
import { OrderStatusHistoryRepository } from './order-status-history.repository';
import { OrderService } from './order.service';

function createOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-id',
    userId: 'customer-id',
    status: OrderStatus.PENDING,
    items: [
      {
        productId: 'product-id',
        quantity: 2,
      },
    ],
    ...overrides,
  };
}

function createService() {
  const transaction = { id: 'transaction-client' };
  const orderRepository = {
    getMyOrderDetail: jest.fn(),
    listOrders: jest.fn(),
    findOrderByIdWithItems: jest.fn(),
    updateOrderStatus: jest.fn(),
  };
  const transactionService = {
    run: jest.fn((callback) => callback(transaction)),
  };
  const orderStatusHistoryRepository = {
    createHistory: jest.fn(),
  };
  const inventoryService = {
    restoreStockForCanceledOrder: jest.fn(),
  };

  return {
    service: new OrderService(
      orderRepository as unknown as OrderRepository,
      transactionService as unknown as TransactionService,
      orderStatusHistoryRepository as unknown as OrderStatusHistoryRepository,
      inventoryService as unknown as InventoryService,
    ),
    orderRepository,
    transactionService,
    orderStatusHistoryRepository,
    inventoryService,
    transaction,
  };
}

describe('OrderService', () => {
  it('should return my order detail when found', async () => {
    const { service, orderRepository } = createService();
    const order = createOrder();
    orderRepository.getMyOrderDetail.mockResolvedValue(order);

    await expect(
      service.getMyOrderDetail('customer-id', 'order-id'),
    ).resolves.toBe(order);
    expect(orderRepository.getMyOrderDetail).toHaveBeenCalledWith(
      'customer-id',
      'order-id',
    );
  });

  it('should reject missing or cross-customer order detail as not found', async () => {
    const { service, orderRepository } = createService();
    orderRepository.getMyOrderDetail.mockResolvedValue(null);

    await expect(
      service.getMyOrderDetail('customer-id', 'missing-order-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should cancel a pending customer order with history and inventory restoration', async () => {
    const {
      service,
      orderRepository,
      transactionService,
      orderStatusHistoryRepository,
      inventoryService,
      transaction,
    } = createService();
    const order = createOrder();
    const canceledOrder = { ...order, status: OrderStatus.CANCELED };
    orderRepository.findOrderByIdWithItems.mockResolvedValue(order);
    orderRepository.updateOrderStatus.mockResolvedValue(canceledOrder);

    await expect(
      service.cancelMyOrder('customer-id', 'order-id', {
        reason: 'Changed mind',
      }),
    ).resolves.toBe(canceledOrder);

    expect(transactionService.run).toHaveBeenCalledTimes(1);
    expect(orderRepository.findOrderByIdWithItems).toHaveBeenCalledWith(
      'order-id',
      transaction,
    );
    expect(orderRepository.updateOrderStatus).toHaveBeenCalledWith(
      'order-id',
      OrderStatus.CANCELED,
      transaction,
    );
    expect(orderStatusHistoryRepository.createHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          connect: {
            id: 'order-id',
          },
        },
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.CANCELED,
        note: 'Changed mind',
        changedByUser: {
          connect: {
            id: 'customer-id',
          },
        },
      }),
      transaction,
    );
    expect(inventoryService.restoreStockForCanceledOrder).toHaveBeenCalledWith(
      order,
      transaction,
    );
  });

  it('should reject cancellation for another customer before side effects', async () => {
    const {
      service,
      orderRepository,
      orderStatusHistoryRepository,
      inventoryService,
      transaction,
    } = createService();
    orderRepository.findOrderByIdWithItems.mockResolvedValue(
      createOrder({ userId: 'other-customer-id' }),
    );

    await expect(
      service.cancelMyOrder('customer-id', 'order-id', {}),
    ).rejects.toThrow(ForbiddenException);

    expect(orderRepository.findOrderByIdWithItems).toHaveBeenCalledWith(
      'order-id',
      transaction,
    );
    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(orderStatusHistoryRepository.createHistory).not.toHaveBeenCalled();
    expect(inventoryService.restoreStockForCanceledOrder).not.toHaveBeenCalled();
  });

  it('should reject non-cancelable orders before side effects', async () => {
    const {
      service,
      orderRepository,
      orderStatusHistoryRepository,
      inventoryService,
    } = createService();
    orderRepository.findOrderByIdWithItems.mockResolvedValue(
      createOrder({ status: OrderStatus.SHIPPED }),
    );

    await expect(
      service.cancelMyOrder('customer-id', 'order-id', {}),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(orderRepository.updateOrderStatus).not.toHaveBeenCalled();
    expect(orderStatusHistoryRepository.createHistory).not.toHaveBeenCalled();
    expect(inventoryService.restoreStockForCanceledOrder).not.toHaveBeenCalled();
  });
});
