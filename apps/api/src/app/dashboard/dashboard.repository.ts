import {
  DatabaseService,
  OrderStatus,
  PaymentStatus,
  ProductApprovalStatus,
  ProductStatus,
} from '@e-commerce-platform/database';
import { Roles } from '@e-commerce-platform/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  getSummary() {
    const revenueWhere = {
      paymentStatus: PaymentStatus.SUCCEEDED,
      status: {
        notIn: [OrderStatus.CANCELED, OrderStatus.REFUNDED],
      },
    };

    return this.databaseService.$transaction([
      this.databaseService.order.aggregate({
        where: revenueWhere,
        _sum: {
          totalAmount: true,
        },
      }),
      this.databaseService.order.count(),
      this.databaseService.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: Roles.CUSTOMER,
              },
            },
          },
        },
      }),
      this.databaseService.product.count({
        where: {
          status: {
            not: ProductStatus.ARCHIVED,
          },
        },
      }),
    ]);
  }

  findRecentOrders(limit = 5) {
    return this.databaseService.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  findLowStockCandidates() {
    return this.databaseService.inventoryItem.findMany({
      where: {
        product: {
          status: ProductStatus.ACTIVE,
          approvalStatus: ProductApprovalStatus.APPROVED,
        },
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: [
                {
                  isPrimary: 'desc',
                },
                {
                  sortOrder: 'asc',
                },
                {
                  createdAt: 'asc',
                },
              ],
            },
          },
        },
      },
    });
  }

  findRevenueOrders(since: Date) {
    return this.databaseService.order.findMany({
      where: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: {
          notIn: [OrderStatus.CANCELED, OrderStatus.REFUNDED],
        },
        createdAt: {
          gte: since,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });
  }
}