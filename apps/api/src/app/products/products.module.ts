import { DatabaseModule } from '@e-commerce-platform/database';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AdminProductsController } from './admin-products.controller';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, DatabaseModule, InventoryModule],
  controllers: [AdminProductsController, ProductsController],
  providers: [ProductsRepository, ProductsService],
})
export class ProductsModule {}
