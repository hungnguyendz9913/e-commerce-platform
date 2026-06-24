import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

type RevenueOrder = Awaited<
  ReturnType<DashboardRepository['findRevenueOrders']>
>[number];

@Injectable()
export class DashboardService {
  private readonly lowStockThreshold = 5;

  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getDashboard() {
    const now = new Date();

    const dailyStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 29,
      ),
    );

    const monthlyStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 11,
        1,
      ),
    );

    const [
      summaryResult,
      recentOrders,
      lowStockCandidates,
      revenueOrders,
    ] = await Promise.all([
      this.dashboardRepository.getSummary(),
      this.dashboardRepository.findRecentOrders(),
      this.dashboardRepository.findLowStockCandidates(),
      this.dashboardRepository.findRevenueOrders(monthlyStart),
    ]);

    const [
      revenueAggregate,
      totalOrders,
      totalCustomers,
      totalProducts,
    ] = summaryResult;

    const lowStockProducts = lowStockCandidates
      .map((inventoryItem) => {
        const availableQuantity = Math.max(
          0,
          inventoryItem.stockQuantity -
            inventoryItem.reservedQuantity,
        );

        return {
          id: inventoryItem.product.id,
          sku: inventoryItem.product.sku,
          name: inventoryItem.product.name,
          slug: inventoryItem.product.slug,
          price: this.toNumber(inventoryItem.product.price),
          status: inventoryItem.product.status.toLowerCase(),
          approvalStatus:
            inventoryItem.product.approvalStatus.toLowerCase(),
          imageUrl:
            inventoryItem.product.images[0]?.imageUrl ?? null,
          images: inventoryItem.product.images.map((image) => ({
            imageUrl: image.imageUrl,
            altText: image.altText,
            sortOrder: image.sortOrder,
          })),
          inventory: {
            stockQuantity: inventoryItem.stockQuantity,
            reservedQuantity: inventoryItem.reservedQuantity,
            availableQuantity,
            lowStock:
              availableQuantity <= this.lowStockThreshold,
          },
        };
      })
      .filter(
        (product) =>
          product.inventory.availableQuantity <=
          this.lowStockThreshold,
      )
      .sort(
        (first, second) =>
          first.inventory.availableQuantity -
            second.inventory.availableQuantity ||
          first.name.localeCompare(second.name),
      )
      .slice(0, 5);

    return {
      data: {
        summary: {
          totalRevenue: this.toNumber(
            revenueAggregate._sum.totalAmount,
          ),
          totalOrders,
          totalCustomers,
          totalProducts,
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.user.fullName,
          customerEmail: order.user.email,
          status: order.status.toLowerCase(),
          paymentStatus: order.paymentStatus.toLowerCase(),
          totalAmount: this.toNumber(order.totalAmount),
          createdAt: order.createdAt.toISOString(),
        })),
        lowStockProducts,
        revenueByDay: this.buildDailyRevenue(
          revenueOrders,
          dailyStart,
          30,
        ),
        revenueByMonth: this.buildMonthlyRevenue(
          revenueOrders,
          monthlyStart,
          12,
        ),
      },
    };
  }

  private buildDailyRevenue(
    orders: RevenueOrder[],
    startDate: Date,
    numberOfDays: number,
  ) {
    const totals = new Map<string, number>();

    for (let index = 0; index < numberOfDays; index += 1) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + index);

      totals.set(date.toISOString().slice(0, 10), 0);
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);

      if (totals.has(key)) {
        totals.set(
          key,
          (totals.get(key) ?? 0) +
            this.toNumber(order.totalAmount),
        );
      }
    }

    return Array.from(totals.entries()).map(
      ([date, revenue]) => ({
        date,
        revenue,
      }),
    );
  }

  private buildMonthlyRevenue(
    orders: RevenueOrder[],
    startDate: Date,
    numberOfMonths: number,
  ) {
    const totals = new Map<string, number>();

    for (let index = 0; index < numberOfMonths; index += 1) {
      const date = new Date(
        Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth() + index,
          1,
        ),
      );

      totals.set(date.toISOString().slice(0, 7), 0);
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 7);

      if (totals.has(key)) {
        totals.set(
          key,
          (totals.get(key) ?? 0) +
            this.toNumber(order.totalAmount),
        );
      }
    }

    return Array.from(totals.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );
  }

  private toNumber(
    value: { toString(): string } | null | undefined,
  ) {
    return value ? Number(value.toString()) : 0;
  }
}