import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { CancelOrderDto, ListOrdersQueryDto } from '@e-commerce-platform/api-contracts';
import { Prisma, TransactionService } from '@e-commerce-platform/database';
import { OrderStatus, OrderSortField, SortOrder } from '@e-commerce-platform/types';
import { OrderStatusHistoryRepository } from './order-status-history.repository';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository, private readonly transactionService: TransactionService, private readonly orderStatusHistoryRepository: OrderStatusHistoryRepository, private readonly inventoryService: InventoryService) {}

  async getMyOrderDetail(userId: string, orderId: string) {
    const order = await this.orderRepository.getMyOrderDetail(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getMyOrderList(userId: string, query: ListOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = this.buildOrderWhere(query);
    where.userId = userId;

    const orderBy = this.buildOrderBy(query);

    const [orders, total] = await this.orderRepository.listOrders(
      where,
      orderBy,
      page,
      limit,
    );

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private buildOrderWhere(
    query: ListOrdersQueryDto,
    publicOnly = false,
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (publicOnly) {
      where.status = OrderStatus.SHIPPED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      };
    }

    if (query.q?.trim()) {
      const q = query.q.trim();

      where.OR = [
        {
          orderNumber: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          recipientName: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          recipientPhone: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          user: {
            is: {
              email: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          user: {
            is: {
              fullName: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: ListOrdersQueryDto,
  ): Prisma.OrderOrderByWithRelationInput {
    return {
      [query.sortBy ?? OrderSortField.CREATED_AT]:
        query.sortOrder ?? SortOrder.DESC,
    };
  }

  async cancelMyOrder(
    userId: string,
    orderId: string,
    cancelOrderDto: CancelOrderDto,
  ) {
    return this.transactionService.run(async (transaction) => {
      const order = await this.orderRepository.findOrderByIdWithItems(
        orderId,
        transaction,
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('Order does not belong to current customer');
      }

      this.assertOrderCanBeCanceled(order.status);

      const canceledOrder = await this.orderRepository.updateOrderStatus(
        order.id,
        OrderStatus.CANCELED,
        transaction,
      );

      await this.orderStatusHistoryRepository.createHistory(
        {
          order: {
            connect: {
              id: order.id,
            },
          },
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELED,
          note: cancelOrderDto.reason ?? 'Customer canceled order',
          changedByUser: {
            connect: {
              id: userId,
            },
          },
        },
        transaction,
      );

      await this.inventoryService.restoreStockForCanceledOrder(
        order,
        transaction,
      );

      return canceledOrder;
    });
  }

  private assertOrderCanBeCanceled(status: OrderStatus) {
    const cancelableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
    ];

    if (!cancelableStatuses.includes(status)) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Order cannot be canceled in current status.',
      });
    }
  }
}
