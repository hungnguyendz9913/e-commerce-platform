import { DatabaseService, DbClient, Prisma } from "@e-commerce-platform/database";
import { OrderStatus } from "@e-commerce-platform/types";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrderRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  getMyOrderDetail(userId: string, orderId: string) {
    return this.databaseService.order.findFirst({
      where: {
        userId,
        id: orderId
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        subtotalAmount: true,
        discountAmount: true,
        shippingFee: true,
        taxAmount: true,
        totalAmount: true,
        recipientName: true,
        recipientPhone: true,
        shippingAddress: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productId: true,
            productNameSnapshot: true,
            skuSnapshot: true,
            unitPriceSnapshot: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });
  }

  async listOrders(
    where: Prisma.OrderWhereInput,
    orderBy: Prisma.OrderOrderByWithRelationInput,
    page: number,
    limit: number,
  ) {
    return this.databaseService.$transaction([
      this.databaseService.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          subtotalAmount: true,
          discountAmount: true,
          shippingFee: true,
          taxAmount: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.databaseService.order.count({ where }),
    ]);
  }

  findOrderByIdWithItems(id: string, client: DbClient = this.databaseService) {
    return client.order.findFirst({
      where: { id },
      include: {
        items: true
      }
    });
  }

  updateOrderStatus(id: string, status: OrderStatus, client: DbClient = this.databaseService) {
    return client.order.update({
      where: { id },
      data: { status }
    })
  }
}
