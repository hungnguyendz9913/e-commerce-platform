import { DatabaseModule } from '@e-commerce-platform/database';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminProductsController } from './admin-products.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [AdminProductsController, ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
