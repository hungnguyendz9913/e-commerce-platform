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
    listAdminOrders: jest.fn(),
    getAdminOrderDetail: jest.fn(),
    findOrderByIdWithItems: jest.fn(),
    getOrderById: jest.fn(),
    updateOrderStatus: jest.fn(),
    updateOrderStatusWhenCurrentStatusIn: jest.fn(),
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
    orderRepository.updateOrderStatusWhenCurrentStatusIn.mockResolvedValue(
      canceledOrder,
    );

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
    expect(
      orderRepository.updateOrderStatusWhenCurrentStatusIn,
    ).toHaveBeenCalledWith(
      'order-id',
      [OrderStatus.PENDING, OrderStatus.PROCESSING],
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
    expect(
      orderRepository.updateOrderStatusWhenCurrentStatusIn,
    ).not.toHaveBeenCalled();
    expect(orderStatusHistoryRepository.createHistory).not.toHaveBeenCalled();
    expect(
      inventoryService.restoreStockForCanceledOrder,
    ).not.toHaveBeenCalled();
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

    expect(
      orderRepository.updateOrderStatusWhenCurrentStatusIn,
    ).not.toHaveBeenCalled();
    expect(orderStatusHistoryRepository.createHistory).not.toHaveBeenCalled();
    expect(
      inventoryService.restoreStockForCanceledOrder,
    ).not.toHaveBeenCalled();
  });

  it('should cancel an order as admin with admin history attribution in the active transaction', async () => {
    const {
      service,
      orderRepository,
      transactionService,
      orderStatusHistoryRepository,
      inventoryService,
      transaction,
    } = createService();
    const order = createOrder({ status: OrderStatus.PROCESSING });
    const canceledOrder = { ...order, status: OrderStatus.CANCELED };
    orderRepository.findOrderByIdWithItems.mockResolvedValue(order);
    orderRepository.updateOrderStatusWhenCurrentStatusIn.mockResolvedValue(
      canceledOrder,
    );

    await expect(
      service.adminUpdateStatus(
        'order-id',
        { status: OrderStatus.CANCELED, note: 'Fraud review' },
        'admin-id',
      ),
    ).resolves.toBe(canceledOrder);

    expect(transactionService.run).toHaveBeenCalledTimes(1);
    expect(orderRepository.findOrderByIdWithItems).toHaveBeenCalledWith(
      'order-id',
      transaction,
    );
    expect(
      orderRepository.updateOrderStatusWhenCurrentStatusIn,
    ).toHaveBeenCalledWith(
      'order-id',
      [OrderStatus.PENDING, OrderStatus.PROCESSING],
      OrderStatus.CANCELED,
      transaction,
    );
    expect(orderStatusHistoryRepository.createHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStatus: OrderStatus.PROCESSING,
        toStatus: OrderStatus.CANCELED,
        note: 'Fraud review',
        changedByUser: {
          connect: {
            id: 'admin-id',
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

  it('should return admin order list with customer and item count metadata', async () => {
    const { service, orderRepository } = createService();
    orderRepository.listAdminOrders.mockResolvedValue([
      [
        {
          id: 'order-id',
          orderNumber: 'ORD-1',
          user: {
            id: 'customer-id',
            email: 'customer@example.com',
            fullName: 'Customer',
            phone: '0900000000',
          },
          status: OrderStatus.PENDING,
          paymentStatus: 'PENDING',
          totalAmount: 100,
          _count: {
            items: 2,
          },
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      ],
      1,
    ]);

    await expect(
      service.getAdminOrderList({
        page: 1,
        limit: 10,
        search: 'customer@example.com',
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            id: 'order-id',
            customer: expect.objectContaining({
              email: 'customer@example.com',
            }),
            itemCount: 2,
          }),
        ],
        meta: expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        }),
      }),
    );

    expect(orderRepository.listAdminOrders).toHaveBeenCalledWith(
      expect.objectContaining({
        createdAt: expect.objectContaining({
          gte: new Date('2026-01-01'),
          lte: new Date('2026-01-31'),
        }),
      }),
      { createdAt: 'desc' },
      1,
      10,
    );
  });

  it('should return admin order detail when found', async () => {
    const { service, orderRepository } = createService();
    const order = createOrder();
    orderRepository.getAdminOrderDetail.mockResolvedValue(order);

    await expect(service.getAdminOrderDetail('order-id')).resolves.toBe(order);
    expect(orderRepository.getAdminOrderDetail).toHaveBeenCalledWith(
      'order-id',
    );
  });

  it('should reject missing admin order detail as not found', async () => {
    const { service, orderRepository } = createService();
    orderRepository.getAdminOrderDetail.mockResolvedValue(null);

    await expect(service.getAdminOrderDetail('order-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update admin order status and create history for non-cancel transitions', async () => {
    const {
      service,
      orderRepository,
      orderStatusHistoryRepository,
      inventoryService,
      transaction,
    } = createService();
    const order = createOrder({ status: OrderStatus.PENDING });
    const updatedOrder = { ...order, status: OrderStatus.PROCESSING };
    orderRepository.findOrderByIdWithItems.mockResolvedValue(order);
    orderRepository.updateOrderStatusWhenCurrentStatusIn.mockResolvedValue(
      updatedOrder,
    );

    await expect(
      service.adminUpdateStatus(
        'order-id',
        { status: OrderStatus.PROCESSING, note: 'Approved' },
        'admin-id',
      ),
    ).resolves.toBe(updatedOrder);

    expect(
      orderRepository.updateOrderStatusWhenCurrentStatusIn,
    ).toHaveBeenCalledWith(
      'order-id',
      [OrderStatus.PENDING],
      OrderStatus.PROCESSING,
      transaction,
    );
    expect(orderStatusHistoryRepository.createHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.PROCESSING,
        note: 'Approved',
        changedByUser: {
          connect: {
            id: 'admin-id',
          },
        },
      }),
      transaction,
    );
    expect(
      inventoryService.restoreStockForCanceledOrder,
    ).not.toHaveBeenCalled();
  });
});
