import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { OrderRepository } from './order.repository';
import {
  AdminUpdateStatusDto,
  CancelOrderDto,
  ListOrdersQueryDto,
  ORDER_VALID_TRANSITION,
} from '@e-commerce-platform/api-contracts';
import {
  Prisma,
  TransactionClient,
  TransactionService,
} from '@e-commerce-platform/database';
import {
  OrderStatus,
  OrderSortField,
  SortOrder,
} from '@e-commerce-platform/types';
import { OrderStatusHistoryRepository } from './order-status-history.repository';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly transactionService: TransactionService,
    private readonly orderStatusHistoryRepository: OrderStatusHistoryRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async getMyOrderDetail(userId: string, orderId: string) {
    const order = await this.orderRepository.getMyOrderDetail(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getMyOrderList(userId: string, query: ListOrdersQueryDto) {
    this.assertValidDateRange(query);

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
    const from = query.from ?? query.fromDate;
    const to = query.to ?? query.toDate;
    const search = query.q ?? query.search;

    if (publicOnly) {
      where.status = OrderStatus.SHIPPED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (from || to) {
      where.createdAt = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    if (search?.trim()) {
      const q = search.trim();

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
    const sortFieldMap: Record<
      OrderSortField,
      keyof Prisma.OrderOrderByWithRelationInput
    > = {
      [OrderSortField.CREATED_AT]: 'createdAt',
      [OrderSortField.UPDATED_AT]: 'updatedAt',
      [OrderSortField.ORDER_NUMBER]: 'orderNumber',
      [OrderSortField.TOTAL_AMOUNT]: 'totalAmount',
      [OrderSortField.STATUS]: 'status',
      [OrderSortField.PAYMENT_STATUS]: 'paymentStatus',
    };

    return {
      [sortFieldMap[query.sortBy ?? OrderSortField.CREATED_AT]]: (
        query.sortOrder ?? SortOrder.DESC
      ).toLowerCase(),
    };
  }

  private assertValidDateRange(query: ListOrdersQueryDto) {
    const from = query.from ?? query.fromDate;
    const to = query.to ?? query.toDate;

    if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
      throw new BadRequestException('fromDate must be before toDate');
    }
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
        throw new ForbiddenException(
          'Order does not belong to current customer',
        );
      }

      return this.executeCancelOrder(
        order,
        cancelOrderDto.reason ?? 'Customer canceled order',
        userId,
        transaction,
      );
    });
  }

  private async executeCancelOrder(
    order: Prisma.OrderGetPayload<{ include: { items: true } }>,
    note: string,
    changedByUserId: string,
    transaction: TransactionClient,
  ) {
    const cancelableStatuses = this.getCancelableStatuses();

    this.assertOrderCanBeCanceled(order.status);

    const canceledOrder =
      await this.orderRepository.updateOrderStatusWhenCurrentStatusIn(
        order.id,
        cancelableStatuses,
        OrderStatus.CANCELED,
        transaction,
      );

    if (!canceledOrder) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Order cannot be canceled in current status.',
      });
    }

    await this.createStatusHistory(
      order.id,
      order.status,
      OrderStatus.CANCELED,
      note,
      changedByUserId,
      transaction,
    );

    await this.inventoryService.restoreStockForCanceledOrder(
      order,
      transaction,
    );

    return canceledOrder;
  }

  private async executeStatusUpdate(
    order: { id: string; status: OrderStatus },
    toStatus: OrderStatus,
    note: string | undefined,
    changedByUserId: string,
    transaction: TransactionClient,
  ) {
    const updatedOrder =
      await this.orderRepository.updateOrderStatusWhenCurrentStatusIn(
        order.id,
        [order.status],
        toStatus,
        transaction,
      );

    if (!updatedOrder) {
      throw new BadRequestException('Invalid order status transition');
    }

    await this.createStatusHistory(
      order.id,
      order.status,
      toStatus,
      note,
      changedByUserId,
      transaction,
    );

    return updatedOrder;
  }

  private createStatusHistory(
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    note: string | undefined,
    changedByUserId: string,
    transaction: TransactionClient,
  ) {
    return this.orderStatusHistoryRepository.createHistory(
      {
        order: {
          connect: {
            id: orderId,
          },
        },
        fromStatus,
        toStatus,
        note,
        changedByUser: {
          connect: {
            id: changedByUserId,
          },
        },
      },
      transaction,
    );
  }

  private getCancelableStatuses() {
    return [OrderStatus.PENDING, OrderStatus.PROCESSING];
  }

  private assertOrderCanBeCanceled(status: OrderStatus) {
    if (!this.getCancelableStatuses().includes(status)) {
      throw new UnprocessableEntityException({
        code: 'BUSINESS_RULE_VIOLATION',
        message: 'Order cannot be canceled in current status.',
      });
    }
  }

  private buildAdminOrderWhere(
    query: ListOrdersQueryDto,
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};
    const from = query.from ?? query.fromDate;
    const to = query.to ?? query.toDate;
    const search = query.q ?? query.search;

    if (query.status) {
      where.status = query.status;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }

    if (from || to) {
      where.createdAt = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    if (search?.trim()) {
      const q = search.trim();

      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { recipientName: { contains: q, mode: 'insensitive' } },
        { recipientPhone: { contains: q, mode: 'insensitive' } },
        { user: { is: { email: { contains: q, mode: 'insensitive' } } } },
        { user: { is: { fullName: { contains: q, mode: 'insensitive' } } } },
        { user: { is: { phone: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    return where;
  }

  async getAdminOrderList(query: ListOrdersQueryDto) {
    this.assertValidDateRange(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildAdminOrderWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [orders, total] = await this.orderRepository.listAdminOrders(
      where,
      orderBy,
      page,
      limit,
    );

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        itemCount: order._count.items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminOrderDetail(orderId: string) {
    const order = await this.orderRepository.getAdminOrderDetail(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async adminUpdateStatus(
    orderId: string,
    dto: AdminUpdateStatusDto,
    adminId: string,
  ) {
    return this.transactionService.run(async (transaction) => {
      const currentOrder = await this.orderRepository.findOrderByIdWithItems(
        orderId,
        transaction,
      );
      if (!currentOrder) {
        throw new NotFoundException('Order not found');
      }
      if (!ORDER_VALID_TRANSITION[currentOrder.status].includes(dto.status)) {
        throw new BadRequestException('Invalid order status transition');
      }

      if (dto.status === OrderStatus.CANCELED) {
        return await this.executeCancelOrder(
          currentOrder,
          dto.note ?? 'Admin canceled order',
          adminId,
          transaction,
        );
      }
      return await this.executeStatusUpdate(
        currentOrder,
        dto.status,
        dto.note,
        adminId,
        transaction,
      );
    });
  }
}
