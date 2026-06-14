import { DatabaseService, DbClient, Prisma } from "@e-commerce-platform/database";
import { Injectable } from "@nestjs/common";

@Injectable()
export class OrderStatusHistoryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  createHistory(data: Prisma.OrderStatusHistoryCreateInput, client: DbClient = this.databaseService) {
    return client.orderStatusHistory.create({
      data
    });
  }
}