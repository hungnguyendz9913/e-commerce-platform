import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AdminOrderController } from './admin-order.controller';
import { OrderRepository } from './order.repository';
import { OrderStatusHistoryRepository } from './order-status-history.repository';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [AuthModule, InventoryModule],
  controllers: [OrderController, AdminOrderController],
  providers: [OrderService, OrderRepository, OrderStatusHistoryRepository],
})
export class OrderModule {}
